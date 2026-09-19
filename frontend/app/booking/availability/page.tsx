"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const roomCatalog = [
  {
    name: "Standard Room",
    slug: "standard",
    price: "₱3,500",
    description:
      "A comfortable room designed for a relaxing and convenient stay.",
    features: ["Queen Bed", "Private Comfort Room", "Desk & Coffee Area"],
  },
  {
    name: "Superior Room",
    slug: "superior",
    price: "₱4,500",
    description:
      "A spacious accommodation with additional space for relaxation.",
    features: ["Queen Bed", "Large View", "Sitting Area"],
  },
  {
    name: "Deluxe Room",
    slug: "deluxe",
    price: "₱6,000",
    description:
      "A refined room offering more space and premium features.",
    features: ["King Bed", "Bathtub", "Private Balcony"],
  },
  {
    name: "Executive Room",
    slug: "executive",
    price: "₱8,000",
    description:
      "A premium accommodation offering generous space and comfort.",
    features: ["King Bed", "Large View", "Sitting Area", "Private Balcony"],
  },
  {
    name: "Suite Room",
    slug: "suite",
    price: "₱10,000",
    description:
      "A spacious and luxurious accommodation designed for extra comfort and privacy.",
    features: ["King Bed", "Separate Living Area", "Premium Space"],
  },
];

export default function AvailabilityPage() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [roomType, setRoomType] = useState("all");
  const [searched, setSearched] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<typeof roomCatalog>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!checkIn || !checkOut) {
      alert("Please select your check-in and check-out dates.");
      return;
    }

    if (checkOut <= checkIn) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    setSearching(true);
    setError("");

    try {
      const roomTypesResponse = await fetch(`${apiUrl}/room-types`);
      if (!roomTypesResponse.ok) throw new Error("Room types could not be loaded.");
      const roomTypes = (await roomTypesResponse.json()) as Array<{ id: string; name: string }>;
      const selectedType = roomTypes.find((item) => item.name.toLowerCase() === roomType);
      const params = new URLSearchParams({ checkIn, checkOut });
      if (selectedType) params.set("roomTypeId", selectedType.id);

      const availabilityResponse = await fetch(`${apiUrl}/rooms/availability?${params}`);
      if (!availabilityResponse.ok) throw new Error("Availability could not be checked.");
      const availability = (await availabilityResponse.json()) as Array<{
        room_types?: { name?: string } | null;
      }> | { rooms?: Array<{ room_types?: { name?: string } | null }> };
      const inventory = Array.isArray(availability) ? availability : availability.rooms ?? [];
      const liveTypeNames = new Set(
        inventory.map((room) => room.room_types?.name?.toLowerCase()).filter(Boolean),
      );
      setAvailableRooms(
        roomCatalog.filter((room) => liveTypeNames.has(room.slug) || liveTypeNames.has(room.slug.replace("-", " "))),
      );
      setSearched(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Availability could not be checked.");
      setSearched(false);
    } finally {
      setSearching(false);
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

            <Link href="/#experience" className="hover:text-black/50">
              Experience
            </Link>

            <Link href="/#about" className="hover:text-black/50">
              About
            </Link>

            <Link href="/#contact" className="hover:text-black/50">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Introduction */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs tracking-[0.3em] text-black/50">
            RESERVATIONS
          </p>

          <h2 className="mt-5 text-5xl font-light leading-tight md:text-6xl">
            Find your stay.
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-7 text-black/60">
            Select your dates, number of guests, and preferred room to find
            the accommodation that suits your stay at Valére Haven.
          </p>
        </div>
      </section>

      {/* Search Form */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl border border-black/10 bg-white p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Check-in */}
            <div>
              <label className="text-xs tracking-[0.15em] text-black/50">
                CHECK-IN
              </label>

              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-3 w-full border border-black/15 bg-[#f8f6f1] px-4 py-3 text-sm outline-none focus:border-black/40"
              />
            </div>

            {/* Check-out */}
            <div>
              <label className="text-xs tracking-[0.15em] text-black/50">
                CHECK-OUT
              </label>

              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-3 w-full border border-black/15 bg-[#f8f6f1] px-4 py-3 text-sm outline-none focus:border-black/40"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="text-xs tracking-[0.15em] text-black/50">
                GUESTS
              </label>

              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="mt-3 w-full border border-black/15 bg-[#f8f6f1] px-4 py-3 text-sm outline-none"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5 Guests</option>
                <option value="6">6 Guests</option>
              </select>
            </div>

            {/* Room Type */}
            <div>
              <label className="text-xs tracking-[0.15em] text-black/50">
                ROOM TYPE
              </label>

              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="mt-3 w-full border border-black/15 bg-[#f8f6f1] px-4 py-3 text-sm outline-none"
              >
                <option value="all">All Rooms</option>
                <option value="standard">Standard Room</option>
                <option value="superior">Superior Room</option>
                <option value="deluxe">Deluxe Room</option>
                <option value="executive">Executive Room</option>
                <option value="suite">Suite Room</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={searching}
            className="mt-8 w-full bg-[#1c1c1c] px-6 py-4 text-sm text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {searching ? "Checking live availability..." : "Check Availability"}
          </button>

          {error && (
            <p className="mt-4 border border-[#e4b7ae] bg-[#fff7f5] px-4 py-3 text-sm text-[#a24d3c]">
              {error}
            </p>
          )}
        </div>
      </section>

      {/* Results */}
      {searched && (
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <p className="text-xs tracking-[0.3em] text-black/50">
                AVAILABLE ACCOMMODATIONS
              </p>

              <h3 className="mt-3 text-3xl font-light">
                Choose your room
              </h3>

              <p className="mt-3 text-sm text-black/50">
                {guests} guest{guests !== "1" ? "s" : ""}
                {checkIn && checkOut
                  ? ` · ${checkIn} to ${checkOut}`
                  : ""}
              </p>
            </div>

            <div className="space-y-6">
              {availableRooms.map((room) => (
                <article
                  key={room.slug}
                  className="grid overflow-hidden border border-black/10 bg-white md:grid-cols-3"
                >
                  {/* Image Placeholder */}
                  <div className="flex min-h-[260px] items-center justify-center bg-[#dedbd3]">
                    <span className="text-xs tracking-[0.25em] text-black/40">
                      {room.name.toUpperCase()}
                    </span>
                  </div>

                  {/* Room Details */}
                  <div className="flex flex-col justify-center p-7 md:col-span-2 md:p-9">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs tracking-[0.2em] text-black/40">
                          ROOM
                        </p>

                        <h4 className="mt-2 text-2xl font-light">
                          {room.name}
                        </h4>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-medium">
                          {room.price}
                        </p>

                        <p className="text-xs text-black/50">
                          per night
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 max-w-xl text-sm leading-6 text-black/60">
                      {room.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                      {room.features.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs text-black/50"
                        >
                          • {feature}
                        </span>
                      ))}
                    </div>

                    <button
  onClick={() => {
    const params = new URLSearchParams({
      room: room.slug,
      checkIn,
      checkOut,
      guests,
    });

    router.push(`/booking/guest-information?${params.toString()}`);
  }}
  className="mt-7 inline-block w-fit bg-[#1c1c1c] px-6 py-3 text-sm text-white"
>
  Select Room
</button>
                  </div>
                </article>
              ))}
              {availableRooms.length === 0 && (
                <div className="border border-dashed border-black/15 bg-white p-10 text-center text-sm text-black/50">
                  No rooms are available for the selected dates and room type.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

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