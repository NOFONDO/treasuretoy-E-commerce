import Image from "next/image";
import { CarFront } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage as ProductImageType } from "@/types";

interface Props {
  image?: ProductImageType | null;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Shows the product photo, or a branded placeholder until the admin uploads one. */
export function ProductImage({ image, sizes, priority, className }: Props) {
  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden bg-navy", className)}>
      {image ? (
        <Image src={image.url} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-navy-soft to-navy" role="img" aria-label="Product photo coming soon">
          <CarFront className="size-1/4 text-gold/70" strokeWidth={1.2} aria-hidden />
        </div>
      )}
    </div>
  );
}
