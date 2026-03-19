import { SiteShell } from "@/components/layout/site-shell";

export default function TermsPage() {
  return (
    <SiteShell className="gap-8">
      <section className="glass-panel rounded-[36px] p-8 lg:p-10">
        <p className="section-label">Terms</p>
        <h1 className="mt-4 font-[var(--font-heading)] text-[3rem] leading-[0.95] tracking-[-0.05em] text-[color:var(--surface-dark)]">
          Ground rules for discovery, reviews, and claims.
        </h1>
        <div className="mt-8 space-y-5 text-base leading-8 text-[color:var(--ink-soft)]">
          <p>Reviews should reflect real experiences and avoid misleading or abusive content.</p>
          <p>Business claims should only be submitted by people who can prove ownership or operational responsibility.</p>
          <p>Admin moderation decisions may reject or supersede claims when evidence conflicts or a listing is already owned.</p>
        </div>
      </section>
    </SiteShell>
  );
}
