import Link from "next/link";

import { AdminModerationActionForm } from "@/components/admin/admin-moderation-action-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { getAdminModerationData } from "@/features/admin/service";

type AdminModerationPageProps = {
  searchParams?: Promise<{
    query?: string;
    status?: "open" | "resolved" | "dismissed" | "all";
    targetType?: "business" | "review" | "owner_reply" | "direct_message" | "all";
    page?: string;
  }>;
};

export default async function AdminModerationPage({ searchParams }: AdminModerationPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const data = await getAdminModerationData({
    query: resolvedSearchParams.query,
    status: resolvedSearchParams.status,
    targetType: resolvedSearchParams.targetType,
    page: resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1
  });

  function buildPageLink(page: number) {
    const params = new URLSearchParams();
    if (resolvedSearchParams.query) params.set("query", resolvedSearchParams.query);
    if (resolvedSearchParams.status && resolvedSearchParams.status !== "all") {
      params.set("status", resolvedSearchParams.status);
    }
    if (resolvedSearchParams.targetType && resolvedSearchParams.targetType !== "all") {
      params.set("targetType", resolvedSearchParams.targetType);
    }
    if (page > 1) params.set("page", String(page));

    return params.toString() ? `/admin/moderation?${params.toString()}` : "/admin/moderation";
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        actions={
          <Link className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white" href="/admin/dashboard">
            Back to dashboard
          </Link>
        }
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Moderation" }]}
        description="Unified queue for reported reviews, owner replies, direct messages, and business-level complaints."
        title="Moderation"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-[#e5ebf3] bg-white p-5 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d8ca1]">Open reports</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111b2d]">{data.moderationStats.openReports}</p>
        </div>
        <div className="rounded-[28px] border border-[#e5ebf3] bg-white p-5 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d8ca1]">Resolved</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111b2d]">{data.moderationStats.resolvedReports}</p>
        </div>
        <div className="rounded-[28px] border border-[#e5ebf3] bg-white p-5 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d8ca1]">Dismissed</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111b2d]">{data.moderationStats.dismissedReports}</p>
        </div>
        <div className="rounded-[28px] border border-[#e5ebf3] bg-white p-5 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d8ca1]">Top complaint business</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[#111b2d]">
            {data.queueInsights.topComplaintBusiness?.name ?? "No reports yet"}
          </p>
        </div>
      </section>

      <section className="rounded-[30px] border border-[#e5ebf3] bg-white p-6 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
        <form action="/admin/moderation" className="flex flex-wrap gap-3">
          <input
            className="min-w-[220px] flex-1 rounded-[20px] border border-[#d8e2ee] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
            defaultValue={data.query}
            name="query"
            placeholder="Search business, reporter, or content"
          />
          <select
            className="rounded-[20px] border border-[#d8e2ee] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
            defaultValue={data.status}
            name="status"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select
            className="rounded-[20px] border border-[#d8e2ee] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
            defaultValue={data.targetType}
            name="targetType"
          >
            <option value="all">All targets</option>
            <option value="business">Business</option>
            <option value="review">Review</option>
            <option value="owner_reply">Owner reply</option>
            <option value="direct_message">Direct message</option>
          </select>
          <button
            className="rounded-[20px] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            Filter
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {data.items.map((item) => (
          <article
            key={item.id}
            className="rounded-[30px] border border-[#e5ebf3] bg-white p-6 shadow-[0_14px_36px_rgba(34,51,84,0.06)]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7b91]">
                    {item.targetTypeLabel}
                  </span>
                  <span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7b91]">
                    {item.status}
                  </span>
                  <span className="rounded-full bg-[#fff4e7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#a96a12]">
                    {item.contentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#111b2d]">{item.business?.name ?? "Unknown business"}</p>
                  <p className="mt-1 text-sm text-[#66768c]">
                    Reported by {item.reporter?.displayName ?? "Unknown reporter"} · {item.reason}
                  </p>
                </div>
                <p className="max-w-3xl text-sm leading-7 text-[#4f6179]">{item.preview}</p>
                <p className="text-sm text-[#7d8ca1]">{item.details}</p>
              </div>
              <div className="w-full max-w-md">
                <AdminModerationActionForm
                  reportId={item.id}
                  status={item.status}
                  targetType={item.targetType}
                />
              </div>
            </div>
          </article>
        ))}
        {data.items.length === 0 ? (
          <div className="rounded-[30px] border border-dashed border-[#d8e2ee] bg-white p-10 text-center text-[#66768c]">
            No moderation items match this filter.
          </div>
        ) : null}
      </section>

      <AdminPagination
        buildHref={buildPageLink}
        currentPage={data.currentPage}
        totalPages={data.totalPages}
      />
    </div>
  );
}
