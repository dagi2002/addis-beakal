import Link from "next/link";
import type { ReactNode } from "react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  actions?: ReactNode;
};

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions
}: AdminPageHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-[#75849a]">
            {breadcrumbs.map((item, index) => (
              <span key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.href ? <Link href={item.href}>{item.label}</Link> : <span className="text-[#111b2d]">{item.label}</span>}
                {index < breadcrumbs.length - 1 ? <span>/</span> : null}
              </span>
            ))}
          </nav>
          <div>
            <h1 className="font-[var(--font-heading)] text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.05em] text-[#111b2d]">
              {title}
            </h1>
            {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[#66768c]">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
