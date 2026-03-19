import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { SiteShell } from "@/components/layout/site-shell";
import { getOptionalSessionUser } from "@/lib/viewer";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sessionUser = await getOptionalSessionUser();
  const params = (await searchParams) ?? {};
  const nextPath = getSearchParam(params.next) ?? "/";

  if (sessionUser) {
    redirect(nextPath);
  }

  return (
    <SiteShell className="items-center justify-center">
      <section className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="dark-panel relative overflow-hidden rounded-[40px] px-7 py-8 sm:px-10 sm:py-10">
          <div className="grain-overlay" />
          <div className="relative space-y-8">
            <div className="space-y-4">
              <p className="section-label text-white/74">Phase 2 Access</p>
              <h1 className="editorial-title max-w-2xl text-[clamp(3rem,7vw,5.4rem)] leading-[0.95] text-white">
                Sign in and step into the trusted side of Addis discovery.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/92 sm:text-lg">
                Public browsing stays open, but saves, reviews, ownership claims, and moderation-backed activity now
                run through real account sessions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/12 bg-white/8 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-white/72">Why sign in</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-white">
                  <li>Save businesses across devices</li>
                  <li>Publish one trusted review per listing</li>
                  <li>Track claim requests and profile history</li>
                </ul>
              </div>
              <div className="rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,205,117,0.16),rgba(255,255,255,0.06))] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/72">Demo access</p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-white/92">
                  <p>
                    Member: <code className="rounded bg-white/14 px-2 py-1 text-white">demo@addisbeakal.test</code>
                  </p>
                  <p>
                    Password: <code className="rounded bg-white/14 px-2 py-1 text-white">demo12345</code>
                  </p>
                  <p>
                    Admin: <code className="rounded bg-white/14 px-2 py-1 text-white">admin@addisbeakal.test</code>
                  </p>
                  <p>
                    Password: <code className="rounded bg-white/14 px-2 py-1 text-white">admin12345</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Saved places", value: "Synced" },
                { label: "Review publishing", value: "Trusted" },
                { label: "Claim handoff", value: "Tracked" }
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-white/12 bg-black/18 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/74">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-[40px] p-6 sm:p-8">
          <AuthForm mode="login" nextPath={nextPath} />
        </div>
      </section>
    </SiteShell>
  );
}
