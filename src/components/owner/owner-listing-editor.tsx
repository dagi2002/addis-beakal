"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type OwnerListingEditorProps = {
  businessId: string;
  initialShortDescription: string;
  initialLongDescription: string;
  initialGoogleMapsUrl?: string;
  initialPhotoUrls: string[];
  initialOpeningHours: [string, string][];
};

const defaultOpeningHours: [string, string][] = [
  ["Monday", "7:00 AM - 7:00 PM"],
  ["Tuesday", "7:00 AM - 7:00 PM"],
  ["Wednesday", "7:00 AM - 7:00 PM"],
  ["Thursday", "7:00 AM - 7:00 PM"],
  ["Friday", "7:00 AM - 7:00 PM"],
  ["Saturday", "8:00 AM - 8:00 PM"],
  ["Sunday", "8:00 AM - 6:00 PM"]
];

export function OwnerListingEditor({
  businessId,
  initialShortDescription,
  initialLongDescription,
  initialGoogleMapsUrl,
  initialPhotoUrls,
  initialOpeningHours
}: OwnerListingEditorProps) {
  const router = useRouter();
  const [shortDescription, setShortDescription] = useState(initialShortDescription);
  const [longDescription, setLongDescription] = useState(initialLongDescription);
  const [googleMapsUrl, setGoogleMapsUrl] = useState(initialGoogleMapsUrl ?? "");
  const [photoUrlsText, setPhotoUrlsText] = useState(initialPhotoUrls.join("\n"));
  const [openingHours, setOpeningHours] = useState(
    initialOpeningHours.length === 7 ? initialOpeningHours : defaultOpeningHours
  );
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4 rounded-[24px] border border-black/8 bg-white/72 p-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-black/44">Lightweight editor</p>
      <input
        className="w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
        disabled={isPending}
        onChange={(event) => setShortDescription(event.target.value)}
        placeholder="Short description"
        value={shortDescription}
      />
      <textarea
        className="min-h-28 w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
        disabled={isPending}
        onChange={(event) => setLongDescription(event.target.value)}
        placeholder="Long description"
        value={longDescription}
      />
      <input
        className="w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
        disabled={isPending}
        onChange={(event) => setGoogleMapsUrl(event.target.value)}
        placeholder="Google Maps URL"
        value={googleMapsUrl}
      />
      <textarea
        className="min-h-24 w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
        disabled={isPending}
        onChange={(event) => setPhotoUrlsText(event.target.value)}
        placeholder="One photo URL per line"
        value={photoUrlsText}
      />
      <div className="grid gap-3">
        {openingHours.map(([day, hours], index) => (
          <div key={day} className="grid gap-2 sm:grid-cols-[120px_1fr]">
            <input
              className="rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
              disabled
              value={day}
            />
            <input
              className="rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
              disabled={isPending}
              onChange={(event) =>
                setOpeningHours((current) =>
                  current.map((entry, entryIndex) =>
                    entryIndex === index ? [entry[0], event.target.value] : entry
                  ) as [string, string][]
                )
              }
              value={hours}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="max-w-xl text-xs leading-5 text-[color:var(--ink-soft)]">
          Keep this lightweight editor focused on the details that directly affect trust and discovery.
        </p>
        <button
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={isPending}
          onClick={() => {
            setMessage("");
            startTransition(async () => {
              const response = await fetch(`/api/owner/businesses/${businessId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  shortDescription,
                  longDescription,
                  googleMapsUrl,
                  photoUrls: photoUrlsText
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean),
                  openingHours
                })
              });

              const payload = (await response.json()) as { error?: string };
              if (!response.ok) {
                setMessage(payload.error ?? "Could not update listing.");
                return;
              }

              setMessage("Listing updated.");
              router.refresh();
            });
          }}
          type="button"
        >
          Save listing
        </button>
      </div>
      {message ? <p className="text-sm text-[color:var(--ink-soft)]">{message}</p> : null}
    </div>
  );
}
