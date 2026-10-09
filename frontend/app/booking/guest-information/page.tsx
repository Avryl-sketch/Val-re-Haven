"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, Suspense } from "react";

const validIdTypes = [
  "Philippine Passport",
  "Driver's License",
  "PhilSys National ID",
  "UMID",
  "Postal ID",
  "Voter's ID",
  "PRC ID",
  "Senior Citizen ID",
  "PWD ID",
  "Other Government-Issued ID",
];

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
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idError, setIdError] = useState("");
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

  if (!idType) {
    setIdError("Please select the type of valid ID.");
    return;
  }

  if (!idNumber.trim()) {
    setIdError("Please enter your ID number.");
    return;
  }

  if (!idFile) {
    setIdError("Please upload a copy of your valid ID.");
    return;
  }

  setIdError("");
  setError("");
  setSubmitting(true);

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
          totalAmount: Math.round(roomType.price_per_night * nights * 1.12 * 100) / 100,
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
  idType,
  idNumber,
  idFileName: idFile.name,
  specialRequest,
  reservationId: reservation.id,
  roomRate: roomType.price_per_night,
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

{/* Valid Identification */}
<div className="mt-10 border-t border-black/10 pt-10">
  <div className="mb-6">
    <p className="text-xs tracking-[0.25em] text-black/40">
      IDENTIFICATION
    </p>

    <h3 className="mt-3 text-2xl font-light">
      Valid ID
    </h3>

    <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">
      Please provide a valid government-issued ID for hotel registration.
    </p>
  </div>

  <div className="grid gap-6 md:grid-cols-2">
    {/* ID Type */}
    <div>
      <label
        htmlFor="idType"
        className="text-sm text-black/60"
      >
        Valid ID Type *
      </label>

      <select
        id="idType"
        value={idType}
        onChange={(e) => {
          setIdType(e.target.value);
          setIdError("");
        }}
        className="mt-2 w-full border border-black/15 bg-[#f8f6f1] px-4 py-3 text-sm outline-none focus:border-black/40"
      >
        <option value="">Select ID type</option>

        {validIdTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>

    {/* ID Number */}
    <div>
      <label
        htmlFor="idNumber"
        className="text-sm text-black/60"
      >
        ID Number *
      </label>

      <input
        id="idNumber"
        type="text"
        value={idNumber}
        onChange={(e) => {
          setIdNumber(e.target.value);
          setIdError("");
        }}
        placeholder="Enter your ID number"
        className="mt-2 w-full border border-black/15 bg-[#f8f6f1] px-4 py-3 text-sm outline-none focus:border-black/40"
      />
    </div>
  </div>

  {/* ID Upload */}
  <div className="mt-6">
    <label
      htmlFor="idFile"
      className="text-sm text-black/60"
    >
      Upload Valid ID *
    </label>

    <input
      id="idFile"
      type="file"
      accept="image/jpeg,image/png,application/pdf"
      onChange={(e) => {
        const file = e.target.files?.[0] ?? null;

        if (file && file.size > 5 * 1024 * 1024) {
          setIdFile(null);
          setIdError("The ID file must be 5 MB or smaller.");
          return;
        }

        setIdFile(file);
        setIdError("");
      }}
      className="mt-2 block w-full border border-black/15 bg-[#f8f6f1] text-sm file:mr-4 file:border-0 file:bg-[#1c1c1c] file:px-5 file:py-3 file:text-sm file:text-white"
    />

    <p className="mt-2 text-xs text-black/40">
      Accepted formats: JPG, PNG, or PDF. Maximum size: 5 MB.
    </p>

    {idFile && (
      <p className="mt-2 text-sm text-green-700">
        Selected: {idFile.name}
      </p>
    )}
  </div>

  {/* ID Confirmation */}
  <div className="mt-6 flex items-start gap-3">
    <input
      id="idConfirmation"
      type="checkbox"
      required
      className="mt-1 h-4 w-4"
    />

    <label
      htmlFor="idConfirmation"
      className="text-sm leading-6 text-black/60"
    >
      I confirm that the identification information I provided is
      valid and belongs to me.
    </label>
  </div>

  {idError && (
    <p className="mt-4 border border-[#e4b7ae] bg-[#fff7f5] px-4 py-3 text-sm text-[#a24d3c]">
      {idError}
    </p>
  )}
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