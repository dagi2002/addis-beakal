"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AuthFormProps = {
  mode: "login" | "signup";
  nextPath: string;
};

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("");

        startTransition(async () => {
          const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              displayName,
              email,
              password
            })
          });

          const payload = (await response.json()) as { error?: string };
          if (!response.ok) {
            setMessage(payload.error ?? "We could not complete that request.");
            return;
          }

          router.push(nextPath || "/discover");
          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <p className={`section-label ${mode === "signup" ? "text-white/58" : ""}`}>
          {mode === "login" ? "Account access" : "Create your account"}
        </p>
        <h2
          className={`font-[var(--font-heading)] text-3xl tracking-tight sm:text-4xl ${
            mode === "signup" ? "text-white" : "text-[color:var(--surface-dark)]"
          }`}
        >
          {mode === "login" ? "Welcome back." : "Start your profile."}
        </h2>
        <p className={`text-sm leading-7 ${mode === "signup" ? "text-white/66" : "text-[color:var(--ink-soft)]"}`}>
          {mode === "login"
            ? "Use your account to save listings, publish reviews, and access owner or admin workflows."
            : "Your display name will appear on future reviews while older snapshots stay preserved for audit integrity."}
        </p>
      </div>

      {mode === "signup" ? (
        <input
          className={`w-full rounded-[22px] border px-4 py-3.5 outline-none transition ${
            mode === "signup"
              ? "border-white/14 bg-white/8 text-white placeholder:text-white/38 focus:border-[color:var(--gold)]"
              : "border-black/10 bg-white/75 text-[color:var(--surface-dark)] placeholder:text-black/35 focus:border-[color:var(--accent)]"
          }`}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Display name"
          required
          type="text"
          value={displayName}
        />
      ) : null}
      <input
        className={`w-full rounded-[22px] border px-4 py-3.5 outline-none transition ${
          mode === "signup"
            ? "border-white/14 bg-white/8 text-white placeholder:text-white/38 focus:border-[color:var(--gold)]"
            : "border-black/10 bg-white/75 text-[color:var(--surface-dark)] placeholder:text-black/35 focus:border-[color:var(--accent)]"
        }`}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        required
        type="email"
        value={email}
      />
      <input
        className={`w-full rounded-[22px] border px-4 py-3.5 outline-none transition ${
          mode === "signup"
            ? "border-white/14 bg-white/8 text-white placeholder:text-white/38 focus:border-[color:var(--gold)]"
            : "border-black/10 bg-white/75 text-[color:var(--surface-dark)] placeholder:text-black/35 focus:border-[color:var(--accent)]"
        }`}
        minLength={8}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        required
        type="password"
        value={password}
      />
      <button
        className={`w-full rounded-[999px] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] transition disabled:opacity-60 ${
          mode === "signup"
            ? "bg-[color:var(--gold)] text-[color:var(--surface-dark)] hover:bg-[#f4c777]"
            : "bg-[color:var(--surface-dark)] text-white hover:bg-black"
        }`}
        disabled={isPending}
        type="submit"
      >
        {mode === "login" ? "Sign in" : "Create account"}
      </button>
      {message ? (
        <p className={`rounded-[20px] border px-4 py-3 text-sm ${mode === "signup" ? "border-white/12 bg-white/8 text-white/78" : "border-black/8 bg-black/4 text-[color:var(--ink-soft)]"}`}>
          {message}
        </p>
      ) : null}
      <p className={`text-sm ${mode === "signup" ? "text-white/64" : "text-black/60"}`}>
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          className={`font-medium ${mode === "signup" ? "text-[color:var(--gold)]" : "text-[color:var(--surface-dark)]"}`}
          href={`${mode === "login" ? "/signup" : "/login"}?next=${encodeURIComponent(nextPath)}`}
        >
          {mode === "login" ? "Create one" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
