import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BusinessCard } from "@/components/business/business-card";
import { BusinessDetailTabs } from "@/components/business/business-detail-tabs";
import { SiteShell } from "@/components/layout/site-shell";
import { getBusinessPageData } from "@/features/businesses/service";
import { getViewerId } from "@/lib/viewer";

type BusinessDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BusinessDetailPage({ params }: BusinessDetailPageProps) {
  const { slug } = await params;
  const viewerId = await getViewerId();
  const data = await getBusinessPageData(slug, viewerId);

  return (
    <SiteShell className="pb-0 pt-4" compactMain showHeaderSearch>
      <BusinessDetailTabs
        business={{
          ...data.business,
          category: data.detail.category,
          neighborhood: data.detail.neighborhood
        }}
        detail={data.detail}
        reviews={data.reviews}
        reviewDistribution={data.reviewDistribution}
        viewerState={data.viewerState}
      />

      {data.relatedBusinesses.length > 0 ? (
        <section className="space-y-5">
          <div>
            <p className="section-label">Related places</p>
            <h2 className="editorial-title mt-3">Similar category, same city energy.</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {data.relatedBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </section>
      ) : null}
    </SiteShell>
  );
}
