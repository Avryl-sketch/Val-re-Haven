"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, Suspense } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function GuestInformationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const room = searchParams.get("room") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "2";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue() {
    if (!firstName || !lastName || !email || !phone) {
      alert("Please complete all required fields.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const roomTypesResponse = await fetch(`${apiUrl}/room-types`);
      if (!roomTypesResponse.ok) {
        throw new Error("Room information could not be loaded.");
      }

      const roomTypes = (await roomTypesResponse.json()) as Array<{
        id: string;
        name: string;
        price_per_night: number | null;
      }>;
      const roomType = roomTypes.find(
        (item) => item.name.toLowerCase() === `${room} room`.replace(" room", "").toLowerCase(),
      );

      if (!roomType) {
        throw new Error("The selected room is no longer available.");
      }

      if (roomType.price_per_night === null) {
        throw new Error("Pricing for the selected room is not yet configured.");
      }

      const guestResponse = await fetch(`${apiUrl}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone }),
      });
      if (!guestResponse.ok) {
        throw new Error("Guest information could not be saved.");
      }

      const guest = (await guestResponse.json()) as { id: string };
      const nights = Math.max(
        1,
        Math.ceil(
          (new Date(`${checkOut}T00:00:00`).getTime() -
            new Date(`${checkIn}T00:00:00`).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      const reservationResponse = await fetch(`${apiUrl}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: guest.id,
          roomTypeId: roomType.id,
          checkIn,
          checkOut,
          numberOfGuests: Number(guests),
          totalAmount: roomType.price_per_night * nights,
          depositAmount: roomType.price_per_night * nights * 0.3,
          paymentStatus: "UNPAID",
          specialRequests: specialRequest || undefined,
        }),
      });
      if (!reservationResponse.ok) {
        throw new Error("Your reservation could not be created.");
      }

      const reservation = (await reservationResponse.json()) as { id: string };

      const guestInformation = {
        room,
        checkIn,
        checkOut,
        guests,
        firstName,
        lastName,
        email,
        phone,
        specialRequest,
        reservationId: reservation.id,
      };

      sessionStorage.setItem("valereReservation", JSON.stringify(guestInformation));

      router.push("/booking/summary");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Reservation could not be completed.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#1c1c1c]">
      {/* Header */}
      <header className="border-b border-black/10 bg-[#f8f6f1]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="group">
            <h1 className="text-xl font-semibold tracking-[0.2em]">
              Valére Haven
            </h1>

            <p className="mt-1 text-[10px] tracking-[0.3em] text-black/50">
              HOTEL & RESORT
            </p>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link href="/" className="hover:text-black/50">
              Home
            </Link>

            <Link href="/rooms" className="hover:text-black/50">
              Rooms
            </Link>

            <Link
              href="/booking/availability"
              className="font-medium"
            >
              Reservations
            </Link>
          </nav>
        </div>
      </header>

      {/* Progress */}
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 px-6 py-5 text-xs">
          <span className="text-black/40">01 Availability</span>

          <span className="text-black/20">—</span>

          <span className="font-medium">02 Guest Information</span>

          <span className="text-black/20">—</span>

          <span className="text-black/40">03 Summary</span>

          <span className="text-black/20">—</span>

          <span className="text-black/40">04 Confirmation</span>
        </div>
      </section>

      {/* Page Introduction */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs tracking-[0.3em] text-black/50">
            RESERVATION
          </p>

          <h2 className="mt-5 text-5xl font-light leading-tight md:text-6xl">
            Guest information
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-7 text-black/60">
            Please provide your contact details so we can prepare your
            reservation at Valére Haven.
          </p>
        </div>
      </section>

      {/* Guest Information Form */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="border border-black/10 bg-white p-8 md:p-10">
            <div className="mb-10">
              <p className="text-xs tracking-[0.25em] text-black/40">
                PRIMARY GUEST
              </p>

              <h3 className="mt-3 text-2xl font-light">
                Your details
              </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* First Name */}
              <div>
                <label className="text-sm text-black/60">
                  First Name *
                </label>

                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="mt-2 w-full border border-black/15 bg-[#f8f6f1] px-4 py-3 text-sm outline-none focus:border-black/40"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="text-sm text-black/60">
                  Last Name *
                </label>

                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="mt-2 w-full border border-black/15 bg-[#f8f6f1] px-4 py-3 text-sm outline-none focus:border-black/40"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-black/60">
                  Email Address *
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="mt-2 w-full border border-black/15 bg-[#f8f6f1] px-4 py-3 text-sm outline-none focus:border-black/40"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-black/60">
                  Phone Number *
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+63 900 000 0000"
                  className="mt-2 w-full border border-black/15 bg-[#f8f6f1] px-4 py-3 text-sm outline-none focus:border-black/40"
                />
              </div>
            </div>

            {/* Special Request */}
            <div className="mt-6">
              <label className="text-sm text-black/60">
                Special Requests
              </label>

              <textarea
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                placeholder="Let us know if you have any special requests..."
                rows={5}
                className="mt-2 w-full resize-none border border-black/15 bg-[#f8f6f1] px-4 py-3 text-sm outline-none focus:border-black/40"
              />
            </div>

            <p className="mt-5 text-xs text-black/40">
              * Required fields
            </p>

            {error && (
              <p className="mt-5 border border-[#e4b7ae] bg-[#fff7f5] px-4 py-3 text-sm text-[#a24d3c]">
                {error}
              </p>
            )}

            {/* Continue Button */}
            <div className="mt-8 flex flex-col gap-4 border-t border-black/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/booking/availability"
                className="text-sm text-black/50 hover:text-black"
              >
                ← Back to Availability
              </Link>

              <button
                onClick={handleContinue}
                disabled={submitting}
                className="bg-[#1c1c1c] px-7 py-4 text-sm text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating reservation..." : "Continue to Summary"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h3 className="font-semibold tracking-[0.2em]">
            Valére Haven
          </h3>

          <p className="mt-2 text-sm text-black/50">
            Hotel & Resort
          </p>

          <div className="mt-8 flex flex-col gap-2 text-sm text-black/50 md:flex-row md:gap-8">
            <span>reservations@valerehaven.com</span>
            <span>+63 900 000 0000</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function GuestInformationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f8f6f1] text-[#1c1c1c]">
          <p className="text-sm text-black/50">
            Loading guest information...
          </p>
        </main>
      }
    >
      <GuestInformationForm />
    </Suspense>
  );
}