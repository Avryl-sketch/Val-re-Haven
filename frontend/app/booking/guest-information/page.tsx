"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function GuestInformationForm() {
  const searchParams = useSearchParams();

  const room = searchParams.get("room") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "2";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");

  function handleContinue() {
    if (!firstName || !lastName || !email || !phone) {
      alert("Please complete all required fields.");
      return;
    }

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
    };

    sessionStorage.setItem(
      "valereReservation",
      JSON.stringify(guestInformation)
    );

    window.location.href = "/booking/summary";
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#1c1c1c]">
      {/* Header */}
      <header className="border-b border-black/10 bg-[#f8f6f1]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="group">
            <h1 className="text-xl font-semibold tracking-[0.2em]">
              Valére Haven
            </h1>

            <p className="mt-1 text-[10px] tracking-[0.3em] text-black/50">
              HOTEL & RESORT
            </p>
          </a>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="/" className="hover:text-black/50">
              Home
            </a>

            <a href="/rooms" className="hover:text-black/50">
              Rooms
            </a>

            <a
              href="/booking/availability"
              className="font-medium"
            >
              Reservations
            </a>
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

            {/* Continue Button */}
            <div className="mt-8 flex flex-col gap-4 border-t border-black/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <a
                href="/booking/availability"
                className="text-sm text-black/50 hover:text-black"
              >
                ← Back to Availability
              </a>

              <button
                onClick={handleContinue}
                className="bg-[#1c1c1c] px-7 py-4 text-sm text-white transition hover:bg-black/80"
              >
                Continue to Summary
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