import Link from "next/link";

interface Props {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeading({ title, description, href, linkLabel }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-3xl sm:text-4xl">{title}</h2>
        {description && <p className="mt-2 max-w-xl text-charcoal/70">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="text-sm font-medium text-gold-deep hover:underline">
          {linkLabel ?? "View all"}
        </Link>
      )}
    </div>
  );
}
