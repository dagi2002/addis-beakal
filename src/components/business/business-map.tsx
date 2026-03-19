import { ExternalLink, MapPinned } from "lucide-react";

type BusinessMapProps = {
  businessName: string;
  address: string;
  neighborhood: string;
};

export function BusinessMap({
  businessName,
  address,
  neighborhood
}: BusinessMapProps) {
  const query = encodeURIComponent(`${businessName}, ${address}, Addis Ababa, Ethiopia`);
  const embedUrl = `https://www.google.com/maps?q=${query}&output=embed`;
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section className="glass-panel overflow-hidden rounded-[34px]">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
        <div>
          <p className="section-label">Location</p>
          <h2 className="mt-3 font-[var(--font-heading)] text-[2.2rem] leading-[0.98] tracking-[-0.05em] text-[#23170f]">
            A stronger sense of where this place sits in the city
          </h2>
        </div>
        <a
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.68)] px-4 py-2 text-sm font-medium text-[#23170f]"
          href={externalUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open in Maps
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <iframe
          className="min-h-[300px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title={`Map showing ${businessName}`}
        />
        <div className="space-y-4 bg-[rgba(255,255,255,0.44)] p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,248,239,0.9)] px-3 py-2 text-sm text-[var(--muted-strong)]">
            <MapPinned className="h-4 w-4 text-[var(--accent)]" />
            {neighborhood}
          </div>
          <div className="space-y-2">
            <h3 className="font-[var(--font-heading)] text-[1.8rem] leading-[1.02] tracking-[-0.04em] text-[#23170f]">
              {businessName}
            </h3>
            <p className="text-sm leading-7 text-[var(--muted)]">{address}</p>
          </div>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Phase 1 uses address-based mapping so the public experience stays useful while the
            production data layer grows into precise location records and richer geo-search.
          </p>
        </div>
      </div>
    </section>
  );
}
