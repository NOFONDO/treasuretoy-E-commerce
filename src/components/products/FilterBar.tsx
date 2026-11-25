import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FilterGroup {
  param: string;
  label: string;
  options: { value: string; label: string }[];
}

interface Props {
  basePath: string;
  groups: FilterGroup[];
  active: Record<string, string | undefined>;
}

/** Server-rendered filters: each option is a plain link, so no client JavaScript is needed. */
export function FilterBar({ basePath, groups, active }: Props) {
  const hrefFor = (param: string, value?: string) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(active)) if (v && k !== param) next.set(k, v);
    if (value) next.set(param, value);
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.param} className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-medium text-navy">{group.label}</span>
          <Link href={hrefFor(group.param)} className={chip(!active[group.param])}>All</Link>
          {group.options.map((o) => (
            <Link key={o.value} href={hrefFor(group.param, o.value)} aria-current={active[group.param] === o.value} className={chip(active[group.param] === o.value)}>
              {o.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

const chip = (isActive: boolean) =>
  cn(
    "rounded-full px-3.5 py-1.5 text-sm ring-1 transition-colors",
    isActive ? "bg-navy text-white ring-navy" : "bg-white text-charcoal ring-navy/15 hover:ring-navy/40",
  );
