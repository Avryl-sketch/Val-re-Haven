"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PmsLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.session) {
      setError(signInError?.message ?? "Unable to sign in.");
      setLoading(false);
      return;
    }

    window.localStorage.setItem(
      "valereAccessToken",
      data.session.access_token
    );

    router.replace("/pms");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef1f0] px-6">
      <section className="w-full max-w-md border border-[#d9e1de] bg-[#f8faf9] p-8 shadow-sm">
        <div className="border-b border-[#d9e1de] pb-6">
          <p className="text-lg font-semibold tracking-[0.14em] text-[#173a34]">
            VALERE HAVEN
          </p>
          <p className="mt-2 text-[10px] tracking-[0.25em] text-[#648078]">
            PROPERTY MANAGEMENT SYSTEM
          </p>
        </div>

        <div className="pt-7">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-[#9b6e2e]">
            STAFF ACCESS
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#173a34]">
            Sign in to the PMS
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#5d6e68]">
            Enter your Valere Haven staff account to access hotel operations.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold text-[#526760]"
              >
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full border border-[#cfdad6] bg-white px-4 py-3 text-sm outline-none focus:border-[#173a34]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold text-[#526760]"
              >
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full border border-[#cfdad6] bg-white px-4 py-3 text-sm outline-none focus:border-[#173a34]"
              />
            </div>

            {error && (
              <div className="border border-[#e4b7ae] bg-[#fff7f5] px-4 py-3 text-sm text-[#a24d3c]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#173a34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#102b27] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <a
            href="/"
            className="mt-6 block text-center text-xs font-medium text-[#648078] hover:text-[#173a34]"
          >
            Return to website
          </a>
        </div>
      </section>
    </main>
  );
}
