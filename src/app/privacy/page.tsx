import { SiteShell } from "@/components/layout/site-shell";

export default function PrivacyPage() {
  return (
    <SiteShell className="gap-8">
      <section className="glass-panel rounded-[36px] p-8 lg:p-10">
        <p className="section-label">Privacy</p>
        <h1 className="mt-4 font-[var(--font-heading)] text-[3rem] leading-[0.95] tracking-[-0.05em] text-[color:var(--surface-dark)]">
          Privacy for members, reviewers, and business owners.
        </h1>
        <div className="mt-8 space-y-5 text-base leading-8 text-[color:var(--ink-soft)]">
          <p>We keep account, review, save, and claim data only to run Addis Beakal and support moderation.</p>
          <p>Ownership claims may include uploaded documents and contact details so an admin can verify control of a listing.</p>
          <p>Public-facing pages only show the information needed for discovery and trust signals.</p>
        </div>
      </section>
    </SiteShell>
  );
}
