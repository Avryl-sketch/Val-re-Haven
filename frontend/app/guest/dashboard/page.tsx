"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function GuestDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/guest/login");
        return;
      }

      setEmail(user.email ?? "");
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/guest/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valére Haven</p>

              <h1 className="mt-1 text-3xl font-semibold text-gray-900">
                Guest Dashboard
              </h1>

              <p className="mt-2 text-gray-600">
                Welcome back, {email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Log Out
            </button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                My Reservations
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                View your current and previous hotel reservations.
              </p>

              <button
                onClick={() => router.push("/guest/reservations")}
                className="mt-5 text-sm font-medium text-gray-900 underline"
              >
                View Reservations
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                My Billing
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                View your total charges, payments, and remaining balance.
              </p>

              <button
                onClick={() => router.push("/guest/billing")}
                className="mt-5 text-sm font-medium text-gray-900 underline"
              >
                View Billing
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                My Profile
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                View and manage your guest information.
              </p>

              <button
                onClick={() => router.push("/guest/profile")}
                className="mt-5 text-sm font-medium text-gray-900 underline"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}