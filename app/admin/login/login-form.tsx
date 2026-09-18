"use client";

import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ stage }: { stage?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
        remember: form.get("remember") === "on",
      }),
    });
    if (res.ok) {
      router.push("/admin/events");
      router.refresh();
    } else {
      setError((await res.json()).error ?? "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">

      {stage && (
        <div
          aria-hidden
          style={{ backgroundImage: `url(${stage})` }}
          className="pointer-events-none absolute inset-0 bg-cover bg-right bg-no-repeat opacity-[0.14] mix-blend-luminosity dark:opacity-40 dark:mix-blend-normal"
        />
      )}

      {stage && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--background))_0%,hsl(var(--background)/0.88)_30%,hsl(var(--background)/0.55)_60%,transparent_85%)]"
        />
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute -right-[10%] -top-[30%] size-[45rem] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.28)_0%,hsl(var(--primary)/0.08)_38%,transparent_70%)] blur-3xl motion-safe:animate-[stage-glow_9s_ease-in-out_infinite]"
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center font-display text-[clamp(7rem,21vw,19rem)] leading-none tracking-[0.02em] text-foreground/[0.045]"
      >
        ALBATROSS
      </span>

      <form
        onSubmit={onSubmit}
        className="relative z-10 flex w-full max-w-[27rem] flex-col rounded-card border border-border-subtle bg-surface p-7 shadow-elevated md:p-9"
      >

        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
        />

        <div className="flex items-center justify-center gap-2.5">
          <span aria-hidden className="font-display text-headline leading-none text-brand">
            A
          </span>
          <span className="text-label font-semibold uppercase tracking-[0.28em] text-foreground">
            Albatross
          </span>
        </div>

        <h1 className="pt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Admin Login
        </h1>
        <p className="mx-auto max-w-[22rem] pt-2 text-center text-meta text-muted-foreground">
          Sign in to manage events, catalog, news, members, crew, and gallery.
        </p>

        <div className="flex flex-col gap-4 pt-7">
          <Field
            id="username-field"
            name="username"
            label="Username"
            placeholder="Enter your username"
            autoComplete="username"
            icon={<User aria-hidden className="size-4" />}
          />

          <Field
            id="password-field"
            name="password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            type={reveal ? "text" : "password"}
            icon={<Lock aria-hidden className="size-4" />}
            trailing={
              <button
                type="button"
                onClick={() => setReveal((v) => !v)}
                aria-label={reveal ? "Hide password" : "Show password"}
                aria-pressed={reveal}
                className="flex size-11 items-center justify-center rounded-button text-foreground-muted transition-[color,transform] duration-[160ms] ease-entrance hover:text-brand active:scale-[0.92]"
              >
                {reveal ? (
                  <EyeOff aria-hidden className="size-4" />
                ) : (
                  <Eye aria-hidden className="size-4" />
                )}
              </button>
            }
          />
        </div>

        <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2.5 pt-4 text-meta text-foreground">
          <input type="checkbox" name="remember" className="size-4 accent-primary" />
          Remember me for 30 days
        </label>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-button border border-destructive/45 bg-destructive-soft px-3.5 py-2.5 text-caption font-medium text-destructive"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-button bg-primary text-meta font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-card transition-[background-color,transform] duration-[160ms] ease-entrance hover:bg-primary-hover active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p className="flex items-center gap-3 pt-6 text-caption text-foreground-muted">
          <span aria-hidden className="h-px flex-1 bg-border" />
          <ShieldCheck aria-hidden className="size-3.5 shrink-0 text-brand" />
          Authorized staff only
          <span aria-hidden className="h-px flex-1 bg-border" />
        </p>

        <Link
          href="/"
          className="group mx-auto mt-5 flex min-h-11 items-center gap-2 text-meta font-semibold text-brand transition-[color,transform] duration-[160ms] ease-entrance hover:text-primary-hover"
        >
          <ArrowLeft
            aria-hidden
            className="size-4 transition-transform duration-[160ms] ease-entrance motion-safe:group-hover:-translate-x-1"
          />
          Back to website
        </Link>
      </form>
    </div>
  );
}

function Field({
  id,
  name,
  label,
  icon,
  trailing,
  ...props
}: {
  id: string;
  name: string;
  label: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
} & React.ComponentProps<"input">) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-label font-semibold uppercase tracking-[0.16em] text-brand"
      >
        {label}
      </label>

      <div className="flex items-center rounded-button border border-input bg-background transition-[border-color,box-shadow] duration-[160ms] ease-entrance hover:border-brand has-[input:focus-visible]:border-brand has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring has-[input:focus-visible]:ring-offset-2 has-[input:focus-visible]:ring-offset-background">
        <span aria-hidden className="grid w-11 shrink-0 place-items-center text-brand">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          required
          className="h-12 min-w-0 flex-1 bg-transparent pr-3 text-meta text-foreground outline-none placeholder:text-foreground-muted"
          {...props}
        />
        {trailing}
      </div>
    </div>
  );
}
