import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { SiteShell } from "@/components/layout/site-shell";
import { getOptionalSessionUser } from "@/lib/viewer";

type SignupPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const sessionUser = await getOptionalSessionUser();
  const params = (await searchParams) ?? {};
  const nextPath = getSearchParam(params.next) ?? "/";

  if (sessionUser) {
    redirect(nextPath);
  }

  return (
    <SiteShell className="items-center justify-center">
      <section className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.06fr_0.94fr]">
        <div className="glass-panel relative overflow-hidden rounded-[40px] px-7 py-8 sm:px-10 sm:py-10">
          <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(192,127,53,0.22),transparent_60%)]" />
          <div className="relative space-y-8">
            <div className="space-y-4">
              <p className="section-label">Create Account</p>
              <h1 className="editorial-title max-w-2xl text-[clamp(3rem,7vw,5.1rem)] leading-[0.96] text-[color:var(--surface-dark)]">
                Join the side of the city that remembers where you want to go back.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[color:var(--ink-soft)] sm:text-lg">
                Accounts unlock trusted saves, one-review-per-business publishing, a persistent profile trail, and the
                first real ownership handoff flow.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Reviews", value: "1 per business" },
                { label: "Claims", value: "Tracked status" },
                { label: "Saves", value: "Persistent" }
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-black/8 bg-white/70 px-4 py-5">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-[color:var(--surface-dark)]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.74),rgba(233,224,210,0.58))] p-5 text-sm leading-7 text-[color:var(--ink-soft)]">
              Your public browsing experience stays simple. Creating an account adds traceability, trust, and a cleaner
              platform-level moderation model without changing the visual feel of the product.
            </div>
          </div>
        </div>
        <div className="dark-panel rounded-[40px] p-6 sm:p-8">
          <AuthForm mode="signup" nextPath={nextPath} />
        </div>
      </section>
    </SiteShell>
  );
}
