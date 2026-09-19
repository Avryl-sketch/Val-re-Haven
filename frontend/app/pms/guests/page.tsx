"use client";

import { useEffect, useMemo, useState } from "react";

type Guest = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  identification_reference: string | null;
  notes: string | null;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const navigation = [
  ["Overview", "/pms"],
  ["Reservations", "/pms/reservations"],
  ["Rooms", "/pms/rooms"],
  ["Guests", "/pms/guests"],
  ["Housekeeping", "/pms/housekeeping"],
  ["Billing & Payments", "/pms/billing"],
  ["Reports", "/pms/reports"],
];

export default function PmsGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token) {
      setState("signed-out");
      return;
    }

    fetch(`${apiUrl}/guests`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 403
            ? "Your staff session is not authorized for the PMS."
            : "Guest profiles could not be loaded.");
        }
        return response.json() as Promise<Guest[]>;
      })
      .then((data) => {
        setGuests(data);
        setState("ready");
      })
      .catch((requestError: Error) => {
        setError(requestError.message);
        setState("error");
      });
  }, []);

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return guests;

    return guests.filter((guest) => [
      guest.first_name,
      guest.last_name,
      guest.email,
      guest.phone ?? "",
      guest.address ?? "",
      guest.identification_reference ?? "",
    ].some((value) => value.toLowerCase().includes(query)));
  }, [guests, search]);

  return (
    <main className="min-h-screen bg-[#eef1f0] text-[#172522]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#d9e1de] bg-[#173a34] px-5 py-7 text-white lg:block">
        <a href="/" className="block border-b border-white/15 pb-7">
          <p className="text-lg font-semibold tracking-[0.14em]">VALÉRE HAVEN</p>
          <p className="mt-2 text-[10px] tracking-[0.25em] text-white/55">PROPERTY MANAGEMENT</p>
        </a>
        <nav className="mt-8 space-y-1 text-sm">
          {navigation.map(([label, href]) => (
            <a key={label} href={href} className={`block border-l-2 px-4 py-3 ${label === "Guests" ? "border-[#e0b56d] bg-white/10 text-white" : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-7 left-5 right-5 border-t border-white/15 pt-5 text-xs text-white/45">Internal operations workspace</div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-[#d9e1de] bg-[#f8faf9] px-6 py-5 md:px-10">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-[#648078]">OPERATIONS / GUESTS</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173a34]">Guest profiles</h1>
          </div>
          <a href="/pms" className="text-xs font-semibold text-[#9b6e2e] hover:underline">Back to overview</a>
        </header>

        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 md:py-10">
          {state === "loading" && <section className="flex min-h-[420px] items-center justify-center border border-[#d9e1de] bg-[#f8faf9]"><p className="text-sm text-[#648078]">Loading guest profiles...</p></section>}

          {state === "signed-out" && <section className="max-w-xl border border-[#e2c58f] bg-[#fffaf0] p-8 shadow-sm"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#9b6e2e]">STAFF ACCESS REQUIRED</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#173a34]">Sign in to view guests</h2><p className="mt-4 leading-7 text-[#5d6e68]">Guest profiles are an internal PMS function and are loaded from the NestJS API.</p><a href="/pms/login" className="mt-7 inline-block bg-[#173a34] px-5 py-3 text-sm font-medium text-white">Sign in</a></section>}

          {state === "error" && <section className="border border-[#e4b7ae] bg-[#fff7f5] p-8"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#a24d3c]">GUESTS UNAVAILABLE</p><h2 className="mt-4 text-2xl font-semibold text-[#552b24]">Guest data could not be loaded</h2><p className="mt-3 text-sm text-[#7d4d44]">{error}</p><p className="mt-6 text-xs text-[#7d4d44]">API: {apiUrl}</p></section>}

          {state === "ready" && (
            <section className="border border-[#d9e1de] bg-[#f8faf9] shadow-sm">
              <div className="flex flex-col gap-5 border-b border-[#d9e1de] p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">{filteredGuests.length} RECORDS</p>
                  <h2 className="mt-2 text-xl font-semibold text-[#173a34]">Guest directory</h2>
                </div>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or phone" className="border border-[#cbd8d3] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#173a34]" />
              </div>

              <div className="divide-y divide-[#e3e9e6]">
                {filteredGuests.map((guest) => (
                  <article key={guest.id} className="grid gap-4 px-5 py-5 md:grid-cols-[1.1fr_1fr_1fr] md:items-center md:px-6">
                    <div>
                      <p className="text-sm font-semibold text-[#29423d]">{guest.first_name} {guest.last_name}</p>
                      <p className="mt-1 text-xs text-[#82918c]">Guest ID {guest.id}</p>
                    </div>
                    <div className="text-sm text-[#42615a]">
                      <p>{guest.email}</p>
                      <p className="mt-1 text-xs text-[#82918c]">{guest.phone ?? "No phone number"}</p>
                    </div>
                    <div className="text-xs leading-5 text-[#648078]">
                      <p>{guest.address ?? "No address recorded"}</p>
                      {guest.notes && <p className="mt-1 text-[#82918c]">{guest.notes}</p>}
                    </div>
                  </article>
                ))}
                {filteredGuests.length === 0 && <p className="p-12 text-center text-sm text-[#82918c]">No guest profiles match the current search.</p>}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
