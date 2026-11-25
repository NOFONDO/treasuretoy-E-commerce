"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProduct, setPublished, updateEnquiryStatus } from "@/app/admin/actions";

export function PublishToggle({ productId, published }: { productId: string; published: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => { await setPublished(productId, !published); router.refresh(); })}
      className="text-sm text-navy underline-offset-2 hover:underline disabled:opacity-50"
    >
      {published ? "Unpublish" : "Publish"}
    </button>
  );
}

export function DeleteProductButton({ productId, name }: { productId: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete "${name}" and all its photos and videos? This cannot be undone.`)) return;
          start(async () => {
            const result = await deleteProduct(productId);
            if (result.error) setError(result.error);
            router.refresh();
          });
        }}
        className="text-sm text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
      {error && <span role="alert" className="text-xs text-red-700">{error}</span>}
    </>
  );
}

const statuses = ["new", "contacted", "agreed", "delivered", "cancelled"] as const;

export function EnquiryStatusSelect({ enquiryId, status }: { enquiryId: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Enquiry status"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(async () => { await updateEnquiryStatus(enquiryId, e.target.value); router.refresh(); })}
      className="rounded-lg bg-white px-2 py-1.5 text-sm ring-1 ring-navy/20"
    >
      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
