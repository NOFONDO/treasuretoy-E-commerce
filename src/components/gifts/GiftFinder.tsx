"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { cn } from "@/lib/utils";
import { budgetBands, findGifts, preferences, type Recipient } from "@/services/gift-finder";
import type { Occasion, Product } from "@/types";

type StepId = "occasion" | "recipient" | "age" | "budget" | "preference" | "results";

interface Answers {
  occasion?: Occasion | "any";
  recipient?: Recipient;
  age?: number;
  budget?: number;
  preference?: string;
}

const occasionOptions: { value: Occasion | "any"; label: string }[] = [
  { value: "birthday", label: "Birthday" },
  { value: "christmas", label: "Christmas" },
  { value: "premium", label: "Special occasion" },
  { value: "any", label: "Just because" },
];

const recipientOptions: { value: Recipient; label: string }[] = [
  { value: "child", label: "A child" },
  { value: "teenager", label: "A teenager" },
  { value: "collector", label: "An adult collector" },
];

export function GiftFinder({ products }: { products: Product[] }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState<StepId>("occasion");
  const [history, setHistory] = useState<StepId[]>([]);

  const steps: StepId[] = useMemo(
    () => (answers.recipient === "collector" ? ["occasion", "recipient", "budget", "preference", "results"] : ["occasion", "recipient", "age", "budget", "preference", "results"]),
    [answers.recipient],
  );
  const progress = (steps.indexOf(step) / (steps.length - 1)) * 100;

  function go(next: StepId, patch: Partial<Answers>) {
    setAnswers((a) => ({ ...a, ...patch }));
    setHistory((h) => [...h, step]);
    setStep(next);
  }

  function back() {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setStep(prev);
  }

  const nextAfter = (current: StepId, recipient = answers.recipient): StepId => {
    const list: StepId[] = recipient === "collector" ? ["occasion", "recipient", "budget", "preference", "results"] : ["occasion", "recipient", "age", "budget", "preference", "results"];
    return list[list.indexOf(current) + 1] ?? "results";
  };

  const results = useMemo(() => {
    if (step !== "results" || !answers.recipient) return [];
    const band = answers.budget !== undefined ? budgetBands[answers.budget] : undefined;
    return findGifts(products, {
      recipient: answers.recipient,
      age: answers.age,
      occasion: answers.occasion && answers.occasion !== "any" ? answers.occasion : undefined,
      budgetMinor: band ? { min: band.min, max: band.max } : undefined,
      preferenceId: answers.preference,
    });
  }, [step, answers, products]);

  const ageOptions = answers.recipient === "teenager" ? [13, 14, 15, 16, 17] : Array.from({ length: 13 }, (_, i) => i);

  return (
    <div className="space-y-8">
      <div className="h-1.5 overflow-hidden rounded-full bg-navy/10" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Gift finder progress">
        <motion.div className="h-full bg-gold" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      {history.length > 0 && (
        <button type="button" onClick={back} className="inline-flex items-center gap-1 text-sm text-charcoal/70 hover:text-navy">
          <ArrowLeft className="size-4" aria-hidden /> Back
        </button>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
          {step === "occasion" && (
            <Question title="What are you celebrating?">
              {occasionOptions.map((o) => <Choice key={o.value} onClick={() => go("recipient", { occasion: o.value })}>{o.label}</Choice>)}
            </Question>
          )}

          {step === "recipient" && (
            <Question title="Who is the gift for?">
              {recipientOptions.map((o) => (
                <Choice key={o.value} onClick={() => go(nextAfter("recipient", o.value), { recipient: o.value, age: undefined })}>{o.label}</Choice>
              ))}
            </Question>
          )}

          {step === "age" && (
            <Question title="How old are they?" hint="Toys are matched to the manufacturer's recommended minimum age.">
              {ageOptions.map((age) => <Choice key={age} onClick={() => go(nextAfter("age"), { age })}>{age === 0 ? "Under 1" : `${age} years`}</Choice>)}
            </Question>
          )}

          {step === "budget" && (
            <Question title="What is your budget?" hint="Shown in GBP. You can see other currencies in the shop.">
              {budgetBands.map((b, i) => <Choice key={b.label} onClick={() => go("preference", { budget: i })}>{b.label}</Choice>)}
            </Question>
          )}

          {step === "preference" && (
            <Question title="Anything in particular?">
              {preferences.map((p) => <Choice key={p.id} onClick={() => go("results", { preference: p.id })}>{p.label}</Choice>)}
              <Choice onClick={() => go("results", { preference: undefined })}>Surprise me</Choice>
            </Question>
          )}

          {step === "results" && (
            <div className="space-y-6">
              <h2 className="text-3xl">{results.length > 0 ? `${results.length} ${results.length === 1 ? "gift" : "gifts"} we think they will love` : "Nothing matches yet"}</h2>
              {results.length === 0 && <p className="text-charcoal/75">Try a wider budget or choose “Surprise me”. Or message us and we will find something for you.</p>}
              <ProductGrid products={results} />
              <button type="button" onClick={() => { setAnswers({}); setHistory([]); setStep("occasion"); }} className="text-sm font-medium text-gold-deep underline">Start again</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl">{title}</h2>
      {hint && <p className="text-sm text-charcoal/65">{hint}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

function Choice({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("rounded-2xl bg-white px-5 py-4 text-left font-medium text-navy ring-1 ring-navy/15 transition hover:-translate-y-0.5 hover:ring-gold-deep hover:shadow-md")}>
      {children}
    </button>
  );
}
