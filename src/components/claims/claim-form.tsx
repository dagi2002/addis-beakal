"use client";

import { Building2, MapPin, Paperclip, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { cn } from "@/lib/utils";

type ClaimBusinessOption = {
  id: string;
  name: string;
  neighborhood: string;
  category: string;
};

type ClaimFormProps = {
  businesses: ClaimBusinessOption[];
};

export function ClaimForm({ businesses }: ClaimFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [query, setQuery] = useState("");
  const [businessId, setBusinessId] = useState(businesses[0]?.id ?? "");
  const [claimantName, setClaimantName] = useState("");
  const [claimantPhone, setClaimantPhone] = useState("");
  const [proofText, setProofText] = useState("");
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredBusinesses = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return businesses;
    }

    return businesses.filter((business) =>
      [business.name, business.neighborhood, business.category].join(" ").toLowerCase().includes(normalized)
    );
  }, [businesses, query]);

  const selectedBusiness = businesses.find((business) => business.id === businessId) ?? null;

  useEffect(() => {
    if (!filteredBusinesses.length) {
      return;
    }

    const stillVisible = filteredBusinesses.some((business) => business.id === businessId);

    if (!stillVisible) {
      setBusinessId(filteredBusinesses[0]!.id);
    }
  }, [businessId, filteredBusinesses]);

  function resetAfterSubmit() {
    setStep(1);
    setQuery("");
    setClaimantName("");
    setClaimantPhone("");
    setProofText("");
    setProofFiles([]);
    setBusinessId(businesses[0]?.id ?? "");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <h1 className="font-[var(--font-heading)] text-[2.6rem] leading-[0.96] tracking-[-0.05em] text-[color:var(--surface-dark)] sm:text-[3.2rem]">
          Claim Your Business
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-8 text-[color:var(--ink-soft)]">
          Find your business and claim ownership to manage your listing
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm font-semibold text-[color:var(--surface-dark)]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f59e19] text-white">1</span>
          <span>Find Business</span>
        </div>
        <span className={cn("h-px w-14", step === 2 ? "bg-[#f59e19]" : "bg-[#d8e2ee]")} />
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              step === 2 ? "bg-[#f59e19] text-white" : "bg-[#eef3f9] text-[#8ba0ba]"
            )}
          >
            2
          </span>
          <span className={step === 2 ? "text-[color:var(--surface-dark)]" : "text-[#8ba0ba]"}>Submit Claim</span>
        </div>
      </div>

      <div className="rounded-[36px] border border-[rgba(62,46,31,0.08)] bg-white p-6 shadow-[0_24px_60px_rgba(33,46,70,0.08)] sm:p-7">
        {step === 1 ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8aa0ba]">1. Find Business</p>
              <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#121c30]">Find Your Business</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_68px]">
              <input
                className="w-full rounded-[20px] border border-[#d8e2ee] bg-white px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-[#7a8da4] focus:border-[#f59e19]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by business name or neighborhood..."
                type="text"
                value={query}
              />
              <button
                className="inline-flex items-center justify-center rounded-[20px] bg-[#f59e19] text-white"
                type="button"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {filteredBusinesses.slice(0, 6).map((business) => {
                const active = business.id === selectedBusiness?.id;

                return (
                  <button
                    key={business.id}
                    className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-[24px] border px-5 py-5 text-left transition",
                      active
                        ? "border-[#f3be58] bg-[#fff9ea] shadow-[0_12px_30px_rgba(245,158,25,0.12)]"
                        : "border-[#e8eef5] bg-white hover:border-[#f3be58] hover:bg-[#fffdf8]"
                    )}
                    onClick={() => setBusinessId(business.id)}
                    type="button"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#fff3d6] text-[#e98a09]">
                        <Building2 className="h-7 w-7" />
                      </span>
                      <div>
                        <p className="text-[1.15rem] font-semibold text-[#111b2d]">{business.name}</p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#66768c]">
                          <MapPin className="h-4 w-4" />
                          {business.neighborhood}, Addis Ababa
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#eef3fb] px-3 py-1.5 text-sm font-medium text-[#64768c]">
                      {business.category}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredBusinesses.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#d8e2ee] bg-[#fbfcfe] px-5 py-8 text-center text-[#66768c]">
                No businesses matched that search yet.
              </div>
            ) : null}

            <button
              className="w-full rounded-[22px] bg-[#f59e19] px-5 py-4 text-base font-semibold text-white transition hover:bg-[#e58a08] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedBusiness || filteredBusinesses.length === 0}
              onClick={() => setStep(2)}
              type="button"
            >
              Continue with {selectedBusiness?.name ?? "this business"}
            </button>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("");

              startTransition(async () => {
                let proofFileUrls: string[] = [];

                if (proofFiles.length > 0) {
                  const formData = new FormData();
                  proofFiles.forEach((file) => formData.append("files", file));

                  const uploadResponse = await fetch("/api/claims/upload", {
                    method: "POST",
                    body: formData
                  });

                  const uploadPayload = (await uploadResponse.json()) as {
                    error?: string;
                    proofFileUrls?: string[];
                  };

                  if (!uploadResponse.ok) {
                    setMessage(uploadPayload.error ?? "Could not upload your proof file.");
                    return;
                  }

                  proofFileUrls = uploadPayload.proofFileUrls ?? [];
                }

                const response = await fetch("/api/claims", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    businessId,
                    claimantName,
                    claimantPhone,
                    proofText,
                    proofFileUrls
                  })
                });

                const payload = (await response.json()) as { error?: string };
                if (!response.ok) {
                  setMessage(payload.error ?? "Could not submit your claim.");
                  return;
                }

                setMessage("Claim submitted for admin review. A status update was sent to your inbox.");
                resetAfterSubmit();
                router.refresh();
              });
            }}
          >
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8aa0ba]">2. Claim Your Business</p>
              <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#121c30]">
                Find your business and claim ownership to manage your listing
              </h2>
            </div>

            {selectedBusiness ? (
              <div className="flex items-center gap-4 rounded-[24px] border border-[#f3d58a] bg-[#fff8e8] px-5 py-5">
                <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#fff2cf] text-[#e98a09]">
                  <Building2 className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-[1.15rem] font-semibold text-[#111b2d]">{selectedBusiness.name}</p>
                  <p className="mt-1 text-sm text-[#66768c]">{selectedBusiness.neighborhood}</p>
                </div>
              </div>
            ) : null}

            <div className="space-y-4">
              <h3 className="text-[1.9rem] font-semibold tracking-[-0.05em] text-[#121c30]">Your Information</h3>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#111b2d]">Full Name *</span>
                <input
                  className="w-full rounded-[20px] border border-[#d8e2ee] bg-white px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition focus:border-[#f59e19]"
                  onChange={(event) => setClaimantName(event.target.value)}
                  required
                  type="text"
                  value={claimantName}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#111b2d]">Phone Number</span>
                <input
                  className="w-full rounded-[20px] border border-[#d8e2ee] bg-white px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-[#7a8da4] focus:border-[#f59e19]"
                  onChange={(event) => setClaimantPhone(event.target.value)}
                  placeholder="+251..."
                  type="tel"
                  value={claimantPhone}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#111b2d]">Proof of Ownership *</span>
                <textarea
                  className="min-h-32 w-full rounded-[20px] border border-[#d8e2ee] bg-white px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-[#7a8da4] focus:border-[#f59e19]"
                  onChange={(event) => setProofText(event.target.value)}
                  placeholder="Describe how you can prove you own or manage this business (e.g., trade license, registration documents...)"
                  value={proofText}
                />
                <label className="flex cursor-pointer items-center gap-3 rounded-[20px] border border-dashed border-[#d8e2ee] bg-[#fbfcfe] px-4 py-3.5 text-sm text-[#66768c] transition hover:border-[#f59e19] hover:bg-[#fffaf2]">
                  <Paperclip className="h-4 w-4 text-[#f59e19]" />
                  <span>{proofFiles[0]?.name ?? "Upload a proof file (PDF, JPG, PNG, or WEBP)"}</span>
                  <input
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => setProofFiles(Array.from(event.target.files ?? []).slice(0, 1))}
                    type="file"
                  />
                </label>
                <p className="text-xs leading-6 text-[#7a8da4]">
                  Add a written explanation, a supporting file, or both.
                </p>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-[20px] border border-[#d8e2ee] bg-white px-5 py-3.5 text-base font-semibold text-[#121c30] transition hover:bg-[#f8fafc]"
                onClick={() => setStep(1)}
                type="button"
              >
                Back
              </button>
              <button
                className="rounded-[20px] bg-[#f59e19] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#e58a08] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending || !selectedBusiness}
                type="submit"
              >
                Submit Claim
              </button>
            </div>
          </form>
        )}

        {message ? (
          <p className={cn("mt-4 text-sm", message.includes("submitted") ? "text-[#2f7a4b]" : "text-[#b05a21]")}>
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
