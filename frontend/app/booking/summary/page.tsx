"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Reservation = {
  reservationId?: string;
  room: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequest: string;
};

const rooms = {
  standard: {
    name: "Standard Room",
    price: 3500,
  },
  superior: {
    name: "Superior Room",
    price: 4500,
  },
  deluxe: {
    name: "Deluxe Room",
    price: 6000,
  },
  executive: {
    name: "Executive Room",
    price: 8000,
  },
  suite: {
    name: "Suite Room",
    price: 10000,
  },
};

export default function SummaryPage() {
  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const savedReservation =
      sessionStorage.getItem("valereReservation");

    if (savedReservation) {
      setReservation(JSON.parse(savedReservation));
    }
  }, []);

  if (!reservation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f1] px-6 text-[#1c1c1c]">
        <div className="text-center">
          <h1 className="text-3xl font-light">
            No reservation found
          </h1>

          <p className="mt-4 text-sm text-black/50">
            Please start your reservation again.
          </p>

          <Link
            href="/booking/availability"
            className="mt-7 inline-block bg-[#1c1c1c] px-6 py-3 text-sm text-white"
          >
            Check Availability
          </Link>
        </div>
      </main>
    );
  }

  const selectedRoom =
    rooms[reservation.room as keyof typeof rooms] || rooms.standard;

  const checkInDate = new Date(reservation.checkIn);
  const checkOutDate = new Date(reservation.checkOut);

  const difference =
    checkOutDate.getTime() - checkInDate.getTime();

  const numberOfNights = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  const roomTotal =
    selectedRoom.price * numberOfNights;
  const depositDue = roomTotal * 0.3;

  function formatDate(date: string) {
    return new Date(date + "T00:00:00").toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  function handleConfirm() {
    setConfirmed(true);

    sessionStorage.removeItem("valereReservation");
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-[#f8f6f1] text-[#1c1c1c]">

        {/* Header */}
        <header className="border-b border-black/10 bg-[#f8f6f1]">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <Link href="/">
              <h1 className="text-xl font-semibold tracking-[0.2em]">
                Valére Haven
              </h1>

              <p className="mt-1 text-[10px] tracking-[0.3em] text-black/50">
                HOTEL & RESORT
              </p>
            </Link>
          </div>
        </header>

        {/* Confirmation */}
        <section className="flex min-h-[70vh] items-center justify-center px-6 py-20">
          <div className="w-full max-w-2xl border border-black/10 bg-white p-10 text-center md:p-16">

            <p className="text-xs tracking-[0.3em] text-black/50">
              RESERVATION CONFIRMED
            </p>

            <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full border border-black/20">
              <span className="text-2xl">✓</span>
            </div>

            <h2 className="mt-8 text-4xl font-light md:text-5xl">
              Thank you, {reservation.firstName}.
            </h2>

            <p className="mx-auto mt-6 max-w-lg leading-7 text-black/60">
              Your reservation request at Valére Haven
              has been received. We look forward to
              welcoming you.
            </p>

            <div className="mt-10 border-y border-black/10 py-6 text-sm">
              <p className="text-black/40">
                RESERVATION NUMBER
              </p>

              <p className="mt-2 text-lg font-medium tracking-wider">
                {reservation.reservationId
                  ? `VH-${reservation.reservationId.slice(0, 8).toUpperCase()}`
                  : "VH-PENDING"}
              </p>
            </div>

            <div className="mt-8">
              <a
                href="/"
                className="inline-block bg-[#1c1c1c] px-7 py-4 text-sm text-white"
              >
                Return Home
              </a>
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
          </div>
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#1c1c1c]">

      {/* Header */}
      <header className="border-b border-black/10 bg-[#f8f6f1]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link href="/">
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

          <span className="text-black/40">
            01 Availability
          </span>

          <span className="text-black/20">—</span>

          <span className="text-black/40">
            02 Guest Information
          </span>

          <span className="text-black/20">—</span>

          <span className="font-medium">
            03 Summary
          </span>

          <span className="text-black/20">—</span>

          <span className="text-black/40">
            04 Confirmation
          </span>

        </div>
      </section>

      {/* Introduction */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">

          <p className="text-xs tracking-[0.3em] text-black/50">
            RESERVATION
          </p>

          <h2 className="mt-5 text-5xl font-light leading-tight md:text-6xl">
            Review your stay.
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-7 text-black/60">
            Please review your reservation details before
            confirming your stay at Valére Haven.
          </p>

        </div>
      </section>

      {/* Summary */}
      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">

          {/* Reservation Details */}
          <div className="border border-black/10 bg-white p-8 lg:col-span-2">

            <p className="text-xs tracking-[0.25em] text-black/40">
              STAY DETAILS
            </p>

            <h3 className="mt-3 text-2xl font-light">
              {selectedRoom.name}
            </h3>

            <div className="mt-8 grid gap-6 border-t border-black/10 pt-7 sm:grid-cols-2">

              <div>
                <p className="text-xs tracking-wider text-black/40">
                  CHECK-IN
                </p>

                <p className="mt-2 text-sm">
                  {formatDate(reservation.checkIn)}
                </p>
              </div>

              <div>
                <p className="text-xs tracking-wider text-black/40">
                  CHECK-OUT
                </p>

                <p className="mt-2 text-sm">
                  {formatDate(reservation.checkOut)}
                </p>
              </div>

              <div>
                <p className="text-xs tracking-wider text-black/40">
                  GUESTS
                </p>

                <p className="mt-2 text-sm">
                  {reservation.guests} Guests
                </p>
              </div>

              <div>
                <p className="text-xs tracking-wider text-black/40">
                  NUMBER OF NIGHTS
                </p>

                <p className="mt-2 text-sm">
                  {numberOfNights} Nights
                </p>
              </div>

            </div>

            {/* Guest Information */}
            <div className="mt-10 border-t border-black/10 pt-7">

              <p className="text-xs tracking-[0.25em] text-black/40">
                GUEST INFORMATION
              </p>

              <div className="mt-5 space-y-3 text-sm">

                <p>
                  <span className="text-black/40">
                    Name:
                  </span>{" "}
                  {reservation.firstName}{" "}
                  {reservation.lastName}
                </p>

                <p>
                  <span className="text-black/40">
                    Email:
                  </span>{" "}
                  {reservation.email}
                </p>

                <p>
                  <span className="text-black/40">
                    Phone:
                  </span>{" "}
                  {reservation.phone}
                </p>

                <p>
                  <span className="text-black/40">
                    Special Request:
                  </span>{" "}
                  {reservation.specialRequest ||
                    "None"}
                </p>

              </div>

            </div>

            {/* Back */}
            <div className="mt-10 border-t border-black/10 pt-7">

                <Link
                href="/booking/guest-information"
                className="text-sm text-black/50 hover:text-black"
              >
                ← Back to Guest Information
                </Link>

            </div>

          </div>

          {/* Price Summary */}
          <div className="h-fit border border-black/10 bg-white p-8">

            <p className="text-xs tracking-[0.25em] text-black/40">
              PRICE SUMMARY
            </p>

            <div className="mt-7 space-y-4 border-b border-black/10 pb-6 text-sm">

              <div className="flex justify-between gap-4">
                <span className="text-black/50">
                  Room per night
                </span>

                <span>
                  ₱{selectedRoom.price.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-black/50">
                  Number of nights
                </span>

                <span>
                  {numberOfNights}
                </span>
              </div>

            </div>

            <div className="flex items-center justify-between pt-6">

              <span className="text-sm text-black/50">
                Total
              </span>

              <span className="text-2xl font-medium">
                ₱{roomTotal.toLocaleString()}
              </span>

            </div>

            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-sm">
              <span className="text-black/50">30% deposit due</span>
              <span className="font-medium">₱{depositDue.toLocaleString()}</span>
            </div>

            <p className="mt-3 text-xs leading-5 text-black/40">
              The deposit is recorded as unpaid until a supported payment
              provider confirms the transaction. No card details are stored.
            </p>

            <button
              onClick={handleConfirm}
              className="mt-8 w-full bg-[#1c1c1c] px-6 py-4 text-sm text-white transition hover:bg-black/80"
            >
              Confirm Reservation
            </button>

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

            <span>
              reservations@valerehaven.com
            </span>

            <span>
              +63 900 000 0000
            </span>

          </div>

        </div>

      </footer>

    </main>
  );
}