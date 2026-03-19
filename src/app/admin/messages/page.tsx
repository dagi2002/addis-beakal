import { AdminNotificationComposer } from "@/components/admin/admin-notification-composer";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { getAdminMessagesPageData } from "@/features/notifications/service";

export default async function AdminMessagesPage() {
  const data = await getAdminMessagesPageData();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Messages" }
        ]}
        description="Send product updates, announcements, or trust-and-safety notices directly into user inboxes."
        title="Admin Messages"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Total messages" value={String(data.stats.totalNotifications)} />
        <AdminStatCard title="Unread inbox items" value={String(data.stats.unreadNotifications)} />
        <AdminStatCard title="Members" value={String(data.stats.members)} />
        <AdminStatCard title="Owners" value={String(data.stats.owners)} />
      </section>

      <section className="rounded-[30px] border border-[#e6ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
        <h2 className="font-[var(--font-heading)] text-3xl tracking-[-0.05em] text-[#111b2d]">Compose a message</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[#66768c]">
          Use this for updates like holiday notices, new cafe launches, onboarding help, or claim and moderation guidance.
        </p>
        <div className="mt-6">
          <AdminNotificationComposer users={data.users} />
        </div>
      </section>

      <section className="rounded-[30px] border border-[#e6ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
        <h2 className="font-[var(--font-heading)] text-3xl tracking-[-0.05em] text-[#111b2d]">Recent inbox deliveries</h2>
        <div className="mt-6 space-y-3">
          {data.recentNotifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-[24px] border border-[#eef2f7] bg-[#fbfcfe] px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#111b2d]">{notification.title}</p>
                  <p className="mt-1 text-sm text-[#66768c]">{notification.body}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7b91]">
                  {notification.kind.replaceAll("_", " ")}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em] text-[#7d8ca1]">
                <span>Recipient: {notification.recipient?.displayName ?? "Unknown user"}</span>
                <span>Status: {notification.status}</span>
                <span>{notification.createdAt.slice(0, 16).replace("T", " ")}</span>
              </div>
            </div>
          ))}
          {data.recentNotifications.length === 0 ? (
            <p className="text-sm text-[#66768c]">No inbox deliveries yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
