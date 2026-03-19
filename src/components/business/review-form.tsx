"use client";

import { Camera, MessageSquarePlus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ModalShell } from "@/components/shared/modal-shell";
import { cn } from "@/lib/utils";

type ReviewFormProps = {
  businessId: string;
  isAuthenticated: boolean;
  hasReviewed: boolean;
  className?: string;
  label?: string;
};

export function ReviewForm({
  businessId,
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
  const [visitDate, setVisitDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

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
        description="Reviews publish immediately in this phase, but they still use the moderation-aware data model."
        onClose={() => setOpen(false)}
        open={open}
        title="Write a public review"
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("");

            startTransition(async () => {
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
                  visitDate,
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
              setVisitDate("");
              setFiles([]);
              router.refresh();
            });
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-[var(--muted)]">Rating</span>
              <select
                className="w-full rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                onChange={(event) => setRating(Number(event.target.value))}
                value={rating}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} star{value === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-[var(--muted)]">Visit date</span>
              <input
                className="w-full rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                onChange={(event) => setVisitDate(event.target.value)}
                required
                type="date"
                value={visitDate}
              />
            </label>
          </div>
          <input
            className="w-full rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Review title"
            required
            value={title}
          />
          <textarea
            className="min-h-32 w-full rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            onChange={(event) => setBody(event.target.value)}
            placeholder="Share the experience other Addis locals should know about."
            required
            value={body}
          />
          <label className="block rounded-[24px] border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.45)] p-4 text-sm text-[var(--muted)]">
            <span className="mb-3 inline-flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Review photos (up to 4, JPG/PNG/WEBP)
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
            disabled={isPending}
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
