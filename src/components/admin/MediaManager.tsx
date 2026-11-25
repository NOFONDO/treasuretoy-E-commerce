"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Star, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type DragEvent } from "react";
import {
  addImage, addVideo, deleteImage, deleteVideo, makeFeaturedImage, moveImage, updateImageAlt,
} from "@/app/admin/actions";
import { ProductImage } from "@/components/products/ProductImage";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, MEDIA_BUCKET, VIDEO_TYPES } from "@/config/media";
import { getBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import type { AdminImage, AdminVideo } from "@/services/admin-queries";

interface Props {
  productId: string;
  productName: string;
  images: AdminImage[];
  videos: AdminVideo[];
}

interface UploadJob { name: string; error?: string }

const hasType = (list: readonly string[], type: string) => list.includes(type);
const mb = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

/** Validate before uploading so the admin gets a clear message instead of a storage error. */
function validate(file: File): string | null {
  if (hasType(IMAGE_TYPES, file.type)) return file.size > MAX_IMAGE_BYTES ? `Images must be under ${mb(MAX_IMAGE_BYTES)}.` : null;
  if (hasType(VIDEO_TYPES, file.type)) return file.size > MAX_VIDEO_BYTES ? `Videos must be under ${mb(MAX_VIDEO_BYTES)}.` : null;
  return "Use JPG, PNG, WebP, AVIF, MP4 or WebM.";
}

async function uploadToBucket(file: File, productId: string): Promise<string> {
  const supabase = getBrowserClient();
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function MediaManager({ productId, productName, images, videos }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  /** Run a server action, surface its error, then refresh the list. */
  function run(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const result = await action();
      setMessage(result.error ?? "");
      router.refresh();
    });
  }

  async function upload(files: File[]) {
    setMessage("");
    setJobs(files.map((f) => ({ name: f.name })));

    for (const file of files) {
      const problem = validate(file);
      if (problem) {
        setJobs((j) => j.map((x) => (x.name === file.name ? { ...x, error: problem } : x)));
        continue;
      }
      try {
        const url = await uploadToBucket(file, productId);
        const result = hasType(VIDEO_TYPES, file.type) ? await addVideo(productId, url) : await addImage(productId, url, productName);
        if (result.error) throw new Error(result.error);
        setJobs((j) => j.filter((x) => x.name !== file.name));
      } catch (err) {
        const reason = err instanceof Error ? err.message : "Upload failed.";
        setJobs((j) => j.map((x) => (x.name === file.name ? { ...x, error: reason } : x)));
      }
    }
    router.refresh();
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    void upload([...e.dataTransfer.files]);
  }

  return (
    <section className="space-y-6 rounded-2xl bg-white p-6 ring-1 ring-navy/10" aria-labelledby="media-heading">
      <h2 id="media-heading" className="text-xl">Photos and videos</h2>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn("flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors", dragging ? "border-gold bg-gold/10" : "border-navy/20")}
      >
        <UploadCloud className="size-8 text-gold-deep" aria-hidden />
        <p className="text-sm">Drag photos and videos here, or</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full bg-navy px-5 py-2 text-sm text-white">Choose files</button>
        <p className="text-xs text-charcoal/60">Images up to {mb(MAX_IMAGE_BYTES)} (JPG, PNG, WebP, AVIF). Videos up to {mb(MAX_VIDEO_BYTES)} (MP4, WebM).</p>
        <input ref={inputRef} type="file" multiple hidden accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(",")} onChange={(e) => { void upload([...(e.target.files ?? [])]); e.target.value = ""; }} />
      </div>

      <AnimatePresence>
        {jobs.map((job) => (
          <motion.div key={job.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
            <p className="text-sm">{job.name}{job.error && <span className="ml-2 text-red-700">{job.error}</span>}</p>
            {!job.error && (
              <div className="h-1.5 overflow-hidden rounded-full bg-navy/10">
                <motion.div className="h-full w-1/3 bg-gold" animate={{ x: ["-100%", "300%"] }} transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }} />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {message && <p role="alert" className="text-sm text-red-700">{message}</p>}

      {images.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={isPending}>
          {images.map((img, i) => (
            <li key={img.id} className="space-y-2 rounded-xl p-2 ring-1 ring-navy/10">
              <div className="relative overflow-hidden rounded-lg">
                <ProductImage image={img} sizes="300px" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-xs font-medium text-navy">Featured</span>}
              </div>
              <input
                aria-label="Image description (alt text)"
                defaultValue={img.alt}
                maxLength={200}
                onBlur={(e) => e.target.value !== img.alt && run(() => updateImageAlt(img.id, e.target.value))}
                className="w-full rounded-md px-2 py-1.5 text-xs ring-1 ring-navy/20"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <IconButton label="Move earlier" disabled={i === 0} onClick={() => run(() => moveImage(productId, img.id, -1))}><ArrowUp className="size-4" /></IconButton>
                  <IconButton label="Move later" disabled={i === images.length - 1} onClick={() => run(() => moveImage(productId, img.id, 1))}><ArrowDown className="size-4" /></IconButton>
                  <IconButton label="Make featured" disabled={i === 0} onClick={() => run(() => makeFeaturedImage(productId, img.id))}><Star className="size-4" /></IconButton>
                </div>
                <IconButton label="Delete image" onClick={() => confirm("Delete this image?") && run(() => deleteImage(productId, img.id))}><Trash2 className="size-4 text-red-700" /></IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {videos.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {videos.map((v) => (
            <li key={v.id} className="space-y-2 rounded-xl p-2 ring-1 ring-navy/10">
              <video src={v.url} controls preload="metadata" playsInline className="w-full rounded-lg bg-navy" />
              <IconButton label="Delete video" onClick={() => confirm("Delete this video?") && run(() => deleteVideo(productId, v.id))}><Trash2 className="size-4 text-red-700" /></IconButton>
            </li>
          ))}
        </ul>
      )}

      {images.length === 0 && videos.length === 0 && <p className="text-sm text-charcoal/65">No media yet. The product shows a placeholder until you add a photo.</p>}
    </section>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="rounded-md p-1.5 hover:bg-navy/5 disabled:opacity-30">
      {children}
    </button>
  );
}
