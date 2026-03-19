"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type ClaimBusinessOption = {
  id: string;
  name: string;
  neighborhoodId: string;
};

type ClaimFormProps = {
  businesses: ClaimBusinessOption[];
};

export function ClaimForm({ businesses }: ClaimFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [businessId, setBusinessId] = useState(businesses[0]?.id ?? "");
  const [relationship, setRelationship] = useState("");
  const [proofText, setProofText] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredBusinesses = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return businesses;
    }

    return businesses.filter((business) => business.name.toLowerCase().includes(normalized));
  }, [businesses, query]);

  const selectedBusiness = filteredBusinesses.find((business) => business.id === businessId) ?? businesses.find((business) => business.id === businessId);

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("");

        startTransition(async () => {
          const response = await fetch("/api/claims", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              businessId,
              relationship,
              proofText
            })
          });

          const payload = (await response.json()) as { error?: string };
          if (!response.ok) {
            setMessage(payload.error ?? "Could not submit your claim.");
            return;
          }

          setMessage("Claim submitted for admin review.");
          setRelationship("");
          setProofText("");
          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <p className="section-label">Submit a claim</p>
        <h2 className="font-[var(--font-heading)] text-3xl text-[color:var(--surface-dark)]">Tell us which listing is yours.</h2>
        <p className="text-sm leading-7 text-[color:var(--ink-soft)]">
          Search the current directory, confirm the listing, and explain your relationship to the business.
        </p>
      </div>

      <input
        className="w-full rounded-[22px] border border-black/10 bg-white/80 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search unclaimed businesses"
        type="text"
        value={query}
      />
      <select
        className="w-full rounded-[22px] border border-black/10 bg-white/80 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition focus:border-[color:var(--accent)]"
        onChange={(event) => setBusinessId(event.target.value)}
        value={businessId}
      >
        {filteredBusinesses.map((business) => (
          <option key={business.id} value={business.id}>
            {business.name}
          </option>
        ))}
      </select>
      {selectedBusiness ? (
        <div className="rounded-[24px] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[color:var(--ink-soft)]">
          Selected listing: <span className="font-semibold text-[color:var(--surface-dark)]">{selectedBusiness.name}</span>
        </div>
      ) : null}
      <input
        className="w-full rounded-[22px] border border-black/10 bg-white/80 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
        onChange={(event) => setRelationship(event.target.value)}
        placeholder="Your relationship to the business"
        required
        type="text"
        value={relationship}
      />
      <textarea
        className="min-h-32 w-full rounded-[24px] border border-black/10 bg-white/80 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
        onChange={(event) => setProofText(event.target.value)}
        placeholder="Describe why you should be approved as the owner or operator."
        required
        value={proofText}
      />
      <button
        className="rounded-full bg-[color:var(--surface-dark)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60"
        disabled={isPending || !businessId}
        type="submit"
      >
        Submit claim
      </button>
      {message ? <p className="text-sm text-[color:var(--ink-soft)]">{message}</p> : null}
    </form>
  );
}
