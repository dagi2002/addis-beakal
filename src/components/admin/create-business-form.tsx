"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { BUSINESS_FEATURE_OPTIONS, BUSINESS_WEEKDAYS } from "@/features/businesses/catalog";
import { cn } from "@/lib/utils";

type CreateBusinessFormProps = {
  categories: Array<{ id: string; name: string }>;
  neighborhoods: Array<{ id: string; name: string }>;
  existingBusinesses: Array<{
    id: string;
    name: string;
    categoryId: string;
    neighborhoodId: string;
    address: string;
    googleMapsUrl: string;
    bannerImageUrl: string;
    priceTier: "$" | "$$" | "$$$" | "$$$$";
    features: string[];
    tags: string[];
    shortDescription: string;
    longDescription: string;
    photoUrls: string[];
    openingHours: [string, string][];
    services: Array<{ name: string; priceEtb: number; description: string }>;
  }>;
};

type ServiceDraft = {
  name: string;
  priceEtb: string;
  description: string;
};

function createInitialHours() {
  return BUSINESS_WEEKDAYS.map((day, index) => ({
    day,
    hours:
      index < 5
        ? "7:00 AM - 7:00 PM"
        : index === 5
          ? "8:00 AM - 8:00 PM"
          : "8:00 AM - 6:00 PM"
  }));
}

function createInitialForm() {
  return {
    name: "",
    categoryId: "",
    neighborhoodId: "",
    address: "",
    googleMapsUrl: "",
    bannerImageUrl: "",
    priceTier: "$$" as "$" | "$$" | "$$$" | "$$$$",
    features: [] as string[],
    tags: "",
    shortDescription: "",
    longDescription: "",
    photoUrls: [""] as string[],
    openingHours: createInitialHours(),
    services: [{ name: "", priceEtb: "", description: "" }] as ServiceDraft[]
  };
}

export function CreateBusinessForm({
  categories,
  neighborhoods,
  existingBusinesses
}: CreateBusinessFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(createInitialForm);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  function updateField<Key extends keyof ReturnType<typeof createInitialForm>>(
    key: Key,
    value: ReturnType<typeof createInitialForm>[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleFeature(feature: string) {
    setForm((current) => ({
      ...current,
      features: current.features.includes(feature)
        ? current.features.filter((item) => item !== feature)
        : [...current.features, feature]
    }));
  }

  function updatePhoto(index: number, value: string) {
    setForm((current) => ({
      ...current,
      photoUrls: current.photoUrls.map((photo, photoIndex) => (photoIndex === index ? value : photo))
    }));
  }

  function addPhotoField() {
    setForm((current) => ({ ...current, photoUrls: [...current.photoUrls, ""] }));
  }

  function removePhotoField(index: number) {
    setForm((current) => ({
      ...current,
      photoUrls: current.photoUrls.length === 1
        ? [""]
        : current.photoUrls.filter((_, photoIndex) => photoIndex !== index)
    }));
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) {
      return [];
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    const response = await fetch("/api/admin/businesses/upload", {
      method: "POST",
      body: formData
    });
    const payload = (await response.json()) as { error?: string; photoUrls?: string[] };

    if (!response.ok) {
      throw new Error(payload.error ?? "Could not upload business images.");
    }

    return payload.photoUrls ?? [];
  }

  function updateHour(index: number, hours: string) {
    setForm((current) => ({
      ...current,
      openingHours: current.openingHours.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, hours } : entry
      )
    }));
  }

  function updateService(index: number, key: keyof ServiceDraft, value: string) {
    setForm((current) => ({
      ...current,
      services: current.services.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, [key]: value } : service
      )
    }));
  }

  function addService() {
    setForm((current) => ({
      ...current,
      services: [...current.services, { name: "", priceEtb: "", description: "" }]
    }));
  }

  function removeService(index: number) {
    setForm((current) => ({
      ...current,
      services:
        current.services.length === 1
          ? [{ name: "", priceEtb: "", description: "" }]
          : current.services.filter((_, serviceIndex) => serviceIndex !== index)
    }));
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("");

        startTransition(async () => {
          const response = await fetch("/api/admin/businesses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              businessId: selectedBusinessId,
              ...form,
              photoUrls: form.photoUrls.map((url) => url.trim()).filter(Boolean),
              openingHours: form.openingHours.map((entry) => [entry.day, entry.hours.trim()]),
              services: form.services.map((service) => ({
                name: service.name,
                priceEtb: Number(service.priceEtb),
                description: service.description
              }))
            })
          });

          const payload = (await response.json()) as { error?: string; business?: { name: string } };
          if (!response.ok) {
            setMessage(payload.error ?? "Could not create business.");
            return;
          }

          if (!selectedBusinessId) {
            setForm(createInitialForm());
          }

          setMessage(
            selectedBusinessId
              ? `${payload.business?.name ?? "Business"} updated successfully.`
              : `${payload.business?.name ?? "Business"} added successfully.`
          );
          router.refresh();
        });
      }}
    >
      <section className="space-y-3 rounded-[28px] border border-black/8 bg-white/60 p-5">
        <div>
          <p className="text-sm font-semibold text-[color:var(--surface-dark)]">Mode</p>
          <p className="text-xs leading-6 text-[color:var(--ink-soft)]">
            Create a new listing or load an existing one like Hebir Ethiopia for editing.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <select
            className="w-full rounded-[22px] border border-black/10 bg-white px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition focus:border-[color:var(--accent)]"
            onChange={(event) => {
              const businessId = event.target.value;
              setSelectedBusinessId(businessId);
              setMessage("");

              if (!businessId) {
                setForm(createInitialForm());
                return;
              }

              const business = existingBusinesses.find((item) => item.id === businessId);
              if (!business) {
                return;
              }

              setForm({
                name: business.name,
                categoryId: business.categoryId,
                neighborhoodId: business.neighborhoodId,
                address: business.address,
                googleMapsUrl: business.googleMapsUrl,
                bannerImageUrl: business.bannerImageUrl,
                priceTier: business.priceTier,
                features: business.features,
                tags: business.tags.join(", "),
                shortDescription: business.shortDescription,
                longDescription: business.longDescription,
                photoUrls: business.photoUrls.length ? business.photoUrls : [""],
                openingHours: business.openingHours.length
                  ? BUSINESS_WEEKDAYS.map((day, index) => ({
                      day,
                      hours: business.openingHours[index]?.[1] ?? "Closed"
                    }))
                  : createInitialHours(),
                services: business.services.length
                  ? business.services.map((service) => ({
                      name: service.name,
                      priceEtb: String(service.priceEtb),
                      description: service.description
                    }))
                  : [{ name: "", priceEtb: "", description: "" }]
              });
            }}
            value={selectedBusinessId}
          >
            <option value="">Create new business</option>
            {existingBusinesses.map((business) => (
              <option key={business.id} value={business.id}>
                Edit {business.name}
              </option>
            ))}
          </select>
          <button
            className="rounded-[22px] border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[color:var(--surface-dark)]"
            onClick={() => {
              setSelectedBusinessId("");
              setMessage("");
              setForm(createInitialForm());
            }}
            type="button"
          >
            New listing
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[color:var(--surface-dark)]">Business name</span>
          <input
            className="w-full rounded-[22px] border border-black/10 bg-white/82 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="e.g. Hebir Ethiopia"
            required
            value={form.name}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[color:var(--surface-dark)]">Address</span>
          <input
            className="w-full rounded-[22px] border border-black/10 bg-white/82 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
            onChange={(event) => updateField("address", event.target.value)}
            placeholder="e.g. Bole Medhanialem, Addis Ababa"
            required
            value={form.address}
          />
          <p className="text-xs leading-6 text-[color:var(--ink-soft)]">
            Use the readable public address. This is what people see on the listing card and detail page.
          </p>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[color:var(--surface-dark)]">Google Maps URL</span>
          <input
            className="w-full rounded-[22px] border border-black/10 bg-white/82 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
            onChange={(event) => updateField("googleMapsUrl", event.target.value)}
            placeholder="Optional exact Google Maps share link"
            type="url"
            value={form.googleMapsUrl}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[color:var(--surface-dark)]">Banner image URL</span>
          <div className="flex gap-3">
            <input
              className="w-full rounded-[22px] border border-black/10 bg-white/82 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
              onChange={(event) => updateField("bannerImageUrl", event.target.value)}
              placeholder="Main hero/banner image URL"
              type="url"
              value={form.bannerImageUrl}
            />
            <button
              className="rounded-[22px] border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[color:var(--surface-dark)]"
              disabled={isUploadingBanner}
              onClick={() => bannerInputRef.current?.click()}
              type="button"
            >
              {isUploadingBanner ? "Uploading..." : "Upload"}
            </button>
            <input
              ref={bannerInputRef}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={async (event) => {
                setMessage("");
                setIsUploadingBanner(true);
                try {
                  const [photoUrl] = await uploadFiles(event.target.files);
                  if (photoUrl) {
                    updateField("bannerImageUrl", photoUrl);
                  }
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Could not upload banner.");
                } finally {
                  setIsUploadingBanner(false);
                  event.target.value = "";
                }
              }}
              type="file"
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[color:var(--surface-dark)]">Category</span>
          <select
            className="w-full rounded-[22px] border border-black/10 bg-white/82 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition focus:border-[color:var(--accent)]"
            onChange={(event) => updateField("categoryId", event.target.value)}
            required
            value={form.categoryId}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[color:var(--surface-dark)]">Neighborhood</span>
          <select
            className="w-full rounded-[22px] border border-black/10 bg-white/82 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition focus:border-[color:var(--accent)]"
            onChange={(event) => updateField("neighborhoodId", event.target.value)}
            required
            value={form.neighborhoodId}
          >
            <option value="">Select neighborhood</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood.id} value={neighborhood.id}>
                {neighborhood.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[color:var(--surface-dark)]">Price tier</span>
          <select
            className="w-full rounded-[22px] border border-black/10 bg-white/82 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition focus:border-[color:var(--accent)]"
            onChange={(event) => updateField("priceTier", event.target.value as "$" | "$$" | "$$$" | "$$$$")}
            value={form.priceTier}
          >
            <option value="$">$ Budget · under 300 ETB</option>
            <option value="$$">$$ Mid-range · 300-800 ETB</option>
            <option value="$$$">$$$ Premium · 800-1,800 ETB</option>
            <option value="$$$$">$$$$ Luxury · 1,800+ ETB</option>
          </select>
        </label>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[color:var(--surface-dark)]">Features</p>
            <p className="text-xs leading-6 text-[color:var(--ink-soft)]">
              Pick the structured features used in Explore filters. Custom keywords still belong in tags.
            </p>
          </div>
          <span className="text-xs text-[color:var(--ink-soft)]">{form.features.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_FEATURE_OPTIONS.map((feature) => (
            <button
              key={feature}
              className={cn(
                "rounded-full border px-3 py-2 text-sm transition",
                form.features.includes(feature)
                  ? "border-[#ffb24a] bg-[#fff4e5] font-semibold text-[#ef8b11]"
                  : "border-black/10 bg-white/70 text-[color:var(--muted-strong)] hover:bg-white"
              )}
              onClick={() => toggleFeature(feature)}
              type="button"
            >
              {feature}
            </button>
          ))}
        </div>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[color:var(--surface-dark)]">Custom tags</span>
          <input
            className="w-full rounded-[22px] border border-black/10 bg-white/82 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
            onChange={(event) => updateField("tags", event.target.value)}
            placeholder="Optional extra keywords, comma separated"
            value={form.tags}
          />
        </label>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[color:var(--surface-dark)]">Gallery photos</p>
              <p className="text-xs leading-6 text-[color:var(--ink-soft)]">
                Add extra business photos for the Photos tab.
              </p>
            </div>
            <button
              className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[color:var(--surface-dark)]"
              onClick={addPhotoField}
              type="button"
            >
              Add image
            </button>
            <button
              className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[color:var(--surface-dark)]"
              disabled={isUploadingGallery}
              onClick={() => galleryInputRef.current?.click()}
              type="button"
            >
              {isUploadingGallery ? "Uploading..." : "Upload photos"}
            </button>
            <input
              ref={galleryInputRef}
              multiple
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={async (event) => {
                setMessage("");
                setIsUploadingGallery(true);
                try {
                  const uploadedUrls = await uploadFiles(event.target.files);
                  if (uploadedUrls.length > 0) {
                    setForm((current) => ({
                      ...current,
                      photoUrls: [...current.photoUrls.filter(Boolean), ...uploadedUrls]
                    }));
                  }
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Could not upload gallery photos.");
                } finally {
                  setIsUploadingGallery(false);
                  event.target.value = "";
                }
              }}
              type="file"
            />
          </div>
          <div className="space-y-3">
            {form.photoUrls.map((photoUrl, index) => (
              <div key={`photo-${index}`} className="flex gap-3">
                <input
                  className="w-full rounded-[22px] border border-black/10 bg-white/82 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
                  onChange={(event) => updatePhoto(index, event.target.value)}
                  placeholder={`Photo URL ${index + 1}`}
                  type="url"
                  value={photoUrl}
                />
                <button
                  className="rounded-[22px] border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[color:var(--surface-dark)]"
                  onClick={() => removePhotoField(index)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-[color:var(--surface-dark)]">Opening hours</p>
            <p className="text-xs leading-6 text-[color:var(--ink-soft)]">
              Fill each day. Use `Closed` if the business is not open that day.
            </p>
          </div>
          <div className="grid gap-3">
            {form.openingHours.map((entry, index) => (
              <label key={entry.day} className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                <span className="text-sm font-medium text-[color:var(--surface-dark)]">{entry.day}</span>
                <input
                  className="w-full rounded-[18px] border border-black/10 bg-white/82 px-4 py-3 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
                  onChange={(event) => updateHour(index, event.target.value)}
                  placeholder="e.g. 7:00 AM - 7:00 PM"
                  required
                  value={entry.hours}
                />
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[color:var(--surface-dark)]">Services & menu</p>
            <p className="text-xs leading-6 text-[color:var(--ink-soft)]">
              Add the items and prices you want to show publicly on the listing.
            </p>
          </div>
          <button
            className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[color:var(--surface-dark)]"
            onClick={addService}
            type="button"
          >
            Add service
          </button>
        </div>
        <div className="space-y-4">
          {form.services.map((service, index) => (
            <article key={`service-${index}`} className="rounded-[26px] border border-black/8 bg-white/78 p-4">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_180px_auto]">
                <input
                  className="rounded-[18px] border border-black/10 bg-white px-4 py-3 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
                  onChange={(event) => updateService(index, "name", event.target.value)}
                  placeholder="Service or menu item name"
                  required
                  value={service.name}
                />
                <input
                  className="rounded-[18px] border border-black/10 bg-white px-4 py-3 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
                  min="0"
                  onChange={(event) => updateService(index, "priceEtb", event.target.value)}
                  placeholder="Price ETB"
                  required
                  type="number"
                  value={service.priceEtb}
                />
                <button
                  className="rounded-[18px] border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[color:var(--surface-dark)]"
                  onClick={() => removeService(index)}
                  type="button"
                >
                  Remove
                </button>
              </div>
              <textarea
                className="mt-4 min-h-24 w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
                onChange={(event) => updateService(index, "description", event.target.value)}
                placeholder="Short description of this item"
                required
                value={service.description}
              />
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <label className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-[color:var(--surface-dark)]">Short description</span>
            <span className="text-xs text-[color:var(--ink-soft)]">{form.shortDescription.length}/140</span>
          </div>
          <textarea
            className="min-h-24 w-full rounded-[22px] border border-black/10 bg-white/82 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
            onChange={(event) => updateField("shortDescription", event.target.value)}
            placeholder="A quick summary used on cards and in discovery."
            required
            value={form.shortDescription}
          />
          <p className="text-xs leading-6 text-[color:var(--ink-soft)]">
            Required. Keep this between 20 and 140 characters.
          </p>
        </label>

        <label className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-[color:var(--surface-dark)]">Long description</span>
            <span className="text-xs text-[color:var(--ink-soft)]">{form.longDescription.length}/900</span>
          </div>
          <textarea
            className="min-h-32 w-full rounded-[22px] border border-black/10 bg-white/82 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
            onChange={(event) => updateField("longDescription", event.target.value)}
            placeholder="A fuller description of the business, what it offers, and why people go there."
            required
            value={form.longDescription}
          />
          <p className="text-xs leading-6 text-[color:var(--ink-soft)]">
            Required. Keep this between 40 and 900 characters.
          </p>
        </label>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[color:var(--ink-soft)]">
          New businesses start unclaimed, use the selected feature filters in Explore, and appear in discovery
          immediately after save.
        </p>
        <button
          className="rounded-[999px] bg-[color:var(--surface-dark)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? (selectedBusinessId ? "Saving..." : "Adding...") : selectedBusinessId ? "Save business" : "Add business"}
        </button>
      </div>
      {message ? (
        <p className={`text-sm ${message.includes("successfully") ? "text-[#1a7f57]" : "text-[#b7483a]"}`}>{message}</p>
      ) : null}
    </form>
  );
}
