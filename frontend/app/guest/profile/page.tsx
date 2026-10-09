"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Guest = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
};

export default function GuestProfilePage() {
  const router = useRouter();

  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/guest/login");
        return;
      }

      const { data, error: guestError } = await supabase
        .from("guests")
        .select(
          "id, first_name, last_name, email, phone, address"
        )
        .eq("auth_user_id", user.id)
        .single();

      if (guestError) {
        console.error("Guest profile error:", guestError);
        setError("Unable to load your guest profile.");
        setLoading(false);
        return;
      }

      setGuest(data);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8">
          Loading your profile...
        </div>
      </main>
    );
  }

  if (error || !guest) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8">
          <p className="text-red-600">
            {error || "Guest profile not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-900">
            My Profile
          </h1>

          <p className="mt-2 text-gray-600">
            Your Valére Haven guest information
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <p className="text-sm text-gray-500">First Name</p>
              <p className="font-medium">{guest.first_name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="font-medium">{guest.last_name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{guest.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Mobile Number</p>
              <p className="font-medium">
                {guest.phone || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">
                {guest.address || "Not provided"}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/guest/dashboard")}
            className="mt-8 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}