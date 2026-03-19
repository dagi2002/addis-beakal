"use client";

import { Camera, MessageSquarePlus, Star } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ModalShell } from "@/components/shared/modal-shell";
import { cn } from "@/lib/utils";

type ReviewFormProps = {
  businessId: string;
  businessName: string;
  isAuthenticated: boolean;
  hasReviewed: boolean;
  className?: string;
  label?: string;
};

const REVIEW_TAG_OPTIONS = [
  "great coffee",
  "fasting friendly",
  "halal",
  "live music",
  "rooftop",
  "parking",
  "delivery",
  "strong wifi",
  "outdoor seating",
  "family friendly",
  "affordable",
  "great service",
  "clean",
  "quick service"
] as const;

export function ReviewForm({
  businessId,
  businessName,
  isAuthenticated,
  hasReviewed,
  className,
  label
}: ReviewFormProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const remainingCharacters = Math.max(0, 20 - body.trim().length);
  const canSubmit = remainingCharacters === 0 && files.length <= 4;

  function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  }

  function redirectToLogin() {
    router.push(`/login?next=${encodeURIComponent(pathname || "/discover")}`);
  }

  return (
    <div className="space-y-3">
      <button
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-[var(--surface-dark)] px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        disabled={hasReviewed}
        onClick={() => {
          if (!isAuthenticated) {
            redirectToLogin();
            return;
          }

          setOpen(true);
        }}
        type="button"
      >
        <MessageSquarePlus className="h-4 w-4" />
        {hasReviewed ? "Review submitted" : isAuthenticated ? (label ?? "Write a review") : "Sign in to review"}
      </button>

      <ModalShell
        className="max-w-3xl"
        onClose={() => setOpen(false)}
        open={open}
        title={`Review ${businessName}`}
      >
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("");

            startTransition(async () => {
              if (remainingCharacters > 0) {
                setMessage(`${remainingCharacters} more characters needed.`);
                return;
              }

              if (files.length > 4) {
                setMessage("You can upload up to 4 review photos.");
                return;
              }

              let photoUrls: string[] = [];

              if (files.length > 0) {
                const formData = new FormData();
                files.forEach((file) => formData.append("files", file));

                const uploadResponse = await fetch("/api/reviews/upload", {
                  method: "POST",
                  body: formData
                });

                const uploadPayload = (await uploadResponse.json()) as {
                  error?: string;
                  photoUrls?: string[];
                };

                if (!uploadResponse.ok) {
                  if (uploadResponse.status === 401) {
                    redirectToLogin();
                    return;
                  }

                  setMessage(uploadPayload.error ?? "Could not upload review images.");
                  return;
                }

                photoUrls = uploadPayload.photoUrls ?? [];
              }

              const response = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  businessId,
                  rating,
                  title,
                  body,
                  tags: selectedTags,
                  visitDate: getTodayDate(),
                  photoUrls
                })
              });

              const payload = (await response.json()) as { error?: string };
              if (!response.ok) {
                if (response.status === 401) {
                  redirectToLogin();
                  return;
                }

                setMessage(payload.error ?? "Could not submit your review.");
                return;
              }

              setOpen(false);
              setTitle("");
              setBody("");
              setSelectedTags([]);
              setFiles([]);
              router.refresh();
            });
          }}
        >
          <div className="rounded-[28px] border border-[rgba(62,46,31,0.1)] bg-[rgba(255,255,255,0.62)] p-5">
            <p className="text-sm font-semibold text-[#23170f]">Your Rating *</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;
                const active = value <= rating;

                return (
                  <button
                    key={value}
                    aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                    className={cn(
                      "rounded-full border px-3 py-3 transition",
                      active
                        ? "border-[#f7c96d] bg-[#fff4dc] text-[#ef9a17]"
                        : "border-[var(--border)] bg-white text-[#c6d0dd] hover:border-[#f3be58] hover:text-[#ef9a17]"
                    )}
                    onClick={() => setRating(value)}
                    type="button"
                  >
                    <Star className={cn("h-5 w-5", active && "fill-current")} />
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block space-y-2 text-sm">
            <span className="font-semibold text-[#23170f]">Summary (optional)</span>
            <input
              className="w-full rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give your review a title..."
              value={title}
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-semibold text-[#23170f]">Your Review *</span>
            <textarea
              className="min-h-36 w-full rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              onChange={(event) => setBody(event.target.value)}
              placeholder="Share your experience. What did you love? What could be better?"
              required
              value={body}
            />
            <p className={cn("text-sm", remainingCharacters > 0 ? "text-[#b05a21]" : "text-[#4f7d5e]")}>
              {remainingCharacters > 0 ? `${remainingCharacters} more characters needed` : "Looks good"}
            </p>
          </label>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#23170f]">Tags (optional)</p>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAG_OPTIONS.map((tag) => {
                const active = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    className={cn(
                      "rounded-full border px-3 py-2 text-sm transition",
                      active
                        ? "border-[#f3be58] bg-[#fff4dc] font-semibold text-[#ce7d11]"
                        : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[#f3be58] hover:text-[#ce7d11]"
                    )}
                    onClick={() => toggleTag(tag)}
                    type="button"
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block rounded-[24px] border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.45)] p-4 text-sm text-[var(--muted)]">
            <span className="mb-3 inline-flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photos (optional, max 4)
            </span>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="block w-full"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 4))}
              type="file"
            />
            {files.length > 0 ? (
              <p className="mt-3 text-xs text-[var(--muted)]">{files.map((file) => file.name).join(", ")}</p>
            ) : null}
          </label>
          <button
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={isPending || !canSubmit}
            type="submit"
          >
            Publish review
          </button>
          {message ? <p className="text-sm text-red-700">{message}</p> : null}
        </form>
      </ModalShell>
    </div>
  );
}
