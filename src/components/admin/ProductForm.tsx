"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useState } from "react";
import { saveProduct, type FormState } from "@/app/admin/actions";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";
import { categorySuggestions, scales } from "@/config/categories";
import type { Department, Occasion, Product } from "@/types";

const occasionOptions: { value: Occasion; label: string }[] = [
  { value: "birthday", label: "Birthday" },
  { value: "christmas", label: "Christmas" },
  { value: "premium", label: "Premium gifts" },
];

export function ProductForm({ product }: { product?: Product }) {
  const [state, action] = useActionState<FormState, FormData>(saveProduct, {});
  const [department, setDepartment] = useState<Department>(product?.department ?? "kids");
  const isCollector = department === "collectors";

  return (
    <form action={action} className="space-y-8">
      {product && <input type="hidden" name="id" value={product.id} />}

      <Section title="Basics">
        <Field label="Product name" className="sm:col-span-2"><input name="name" required maxLength={120} defaultValue={product?.name} className={inputClass} /></Field>
        <Field label="SKU"><input name="sku" required maxLength={40} defaultValue={product?.sku} className={inputClass} /></Field>
        <Field label="URL slug" hint="Leave empty to create it from the name."><input name="slug" maxLength={120} defaultValue={product?.slug} className={inputClass} /></Field>
        <Field label="Description" className="sm:col-span-2"><textarea name="description" rows={5} maxLength={4000} defaultValue={product?.description} className={inputClass} /></Field>
      </Section>

      <Section title="Classification">
        <Field label="Department">
          <select name="department" value={department} onChange={(e) => setDepartment(e.target.value as Department)} className={inputClass}>
            <option value="kids">Kids' toy cars</option>
            <option value="collectors">Adult collectibles</option>
          </select>
        </Field>
        <Field label="Category">
          <input name="category" required list="categories" defaultValue={product?.category} className={inputClass} />
          <datalist id="categories">{categorySuggestions[department].map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="Manufacturer"><input name="manufacturer" maxLength={60} defaultValue={product?.manufacturer ?? ""} className={inputClass} /></Field>
        <AnimatePresence initial={false}>
          {isCollector && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Field label="Model scale">
                <select name="scale" defaultValue={product?.scale ?? ""} className={inputClass}>
                  <option value="">None</option>
                  {scales.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      <Section title="Price and stock">
        <Field label="Price (£)" hint="Base price in GBP. Other currencies are converted for display."><input name="price" type="number" step="0.01" min="0.01" required defaultValue={product ? (product.priceMinor / 100).toFixed(2) : ""} className={inputClass} /></Field>
        <Field label="Discount (%)"><input name="discount" type="number" min="0" max="100" defaultValue={product?.discountPercent ?? 0} className={inputClass} /></Field>
        <Field label="Stock quantity"><input name="stock" type="number" min="0" required defaultValue={product?.stock ?? 0} className={inputClass} /></Field>
      </Section>

      <Section title="Age and safety">
        <Field label="Manufacturer's minimum age" hint={isCollector ? "Collector models must be 14+." : "Use the age printed on the packaging."}>
          <input name="ageMin" type="number" min="0" max="99" required defaultValue={product?.ageMin ?? (isCollector ? 14 : "")} className={inputClass} />
        </Field>
        <Field label="Safety information" className="sm:col-span-2" hint="Small parts, batteries, choking hazards, supervision.">
          <textarea name="safetyNotes" rows={3} maxLength={1000} defaultValue={product?.safetyNotes ?? ""} className={inputClass} />
        </Field>
      </Section>

      <Section title="Gifts and labels">
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-medium text-navy">Show in gift collections</legend>
          <div className="flex flex-wrap gap-4">
            {occasionOptions.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="occasions" value={o.value} defaultChecked={product?.occasions.includes(o.value)} /> {o.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-5 text-sm sm:col-span-2">
          <Check name="isFeatured" label="Featured on homepage" checked={product?.isFeatured} />
          <Check name="isLimited" label="Limited edition" checked={product?.isLimited} />
          <Check name="isNew" label="New arrival" checked={product?.isNew} />
        </div>
      </Section>

      <Section title="Search engines">
        <Field label="SEO title" hint="Up to 70 characters."><input name="seoTitle" maxLength={70} defaultValue={product?.seoTitle ?? ""} className={inputClass} /></Field>
        <Field label="SEO description" hint="Up to 160 characters."><input name="seoDescription" maxLength={160} defaultValue={product?.seoDescription ?? ""} className={inputClass} /></Field>
      </Section>

      <div className="flex flex-wrap items-center gap-5 border-t border-navy/10 pt-6">
        <Check name="isPublished" label="Published (visible on the site)" checked={product?.isPublished ?? false} />
        <SubmitButton>{product ? "Save changes" : "Create product"}</SubmitButton>
        <AnimatePresence>
          {state.error && <motion.p role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-red-700">{state.error}</motion.p>}
          {state.saved && <motion.p role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-emerald-700">Saved</motion.p>}
        </AnimatePresence>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl bg-white p-6 ring-1 ring-navy/10">
      <legend className="px-2 font-display text-lg text-navy">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Check({ name, label, checked }: { name: string; label: string; checked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={checked} /> {label}
    </label>
  );
}
