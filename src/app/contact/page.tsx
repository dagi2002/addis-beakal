import { SiteShell } from "@/components/layout/site-shell";

export default function ContactPage() {
  return (
    <SiteShell className="gap-8">
      <section className="glass-panel rounded-[36px] p-8 lg:p-10">
        <p className="section-label">Contact</p>
        <h1 className="mt-4 font-[var(--font-heading)] text-[3rem] leading-[0.95] tracking-[-0.05em] text-[color:var(--surface-dark)]">
          Talk to the Addis Beakal team.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--ink-soft)]">
          Reach out for listing questions, support requests, ownership help, or moderation follow-up.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-[rgba(62,46,31,0.08)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Email</p>
            <a className="mt-3 block text-lg font-semibold text-[color:var(--surface-dark)]" href="mailto:hello@addisbeakal.test">
              hello@addisbeakal.test
            </a>
          </div>
          <div className="rounded-[24px] border border-[rgba(62,46,31,0.08)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Location</p>
            <p className="mt-3 text-lg font-semibold text-[color:var(--surface-dark)]">Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
