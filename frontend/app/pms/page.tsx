"use client";

import { useEffect, useState } from "react";

type DashboardSummary = {
  date: string;
  arrivals: Array<{ id: string; guests?: { first_name: string; last_name: string } }>;
  departures: Array<{ id: string; guests?: { first_name: string; last_name: string } }>;
  currentGuests: Array<{ id: string; guests?: { first_name: string; last_name: string } }>;
  availableRooms: number;
  occupiedRooms: number;
  reservedRooms: number;
  dirtyRooms: number;
  maintenanceRooms: number;
  todayRevenue: number;
  outstandingBalances: number;
  recentReservations: Array<{
    id: string;
    check_in: string;
    check_out: string;
    status: string;
    guests?: { first_name: string; last_name: string };
    room_types?: { name: string };
  }>;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function PmsDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("valereAccessToken");

    if (!token) {
      setState("signed-out");
      return;
    }

    fetch(`${apiUrl}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 403
            ? "Your staff session is not authorized for the PMS."
            : "The PMS dashboard could not load its live data.");
        }
        return response.json() as Promise<DashboardSummary>;
      })
      .then((data) => {
        setSummary(data);
        setState("ready");
      })
      .catch((requestError: Error) => {
        setError(requestError.message);
        setState("error");
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#eef1f0] text-[#172522]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#d9e1de] bg-[#173a34] px-5 py-7 text-white lg:block">
        <a href="/" className="block border-b border-white/15 pb-7">
          <p className="text-lg font-semibold tracking-[0.14em]">VALÉRE HAVEN</p>
          <p className="mt-2 text-[10px] tracking-[0.25em] text-white/55">PROPERTY MANAGEMENT</p>
        </a>
        <nav className="mt-8 space-y-1 text-sm">
          {[
            ["Overview", "/pms"],
            ["Reservations", "/pms/reservations"],
            ["Rooms", "/pms/rooms"],
            ["Guests", "/pms/guests"],
            ["Housekeeping", "/pms/housekeeping"],
            ["Billing & Payments", "/pms/billing"],
            ["Reports", "/pms/reports"],
          ].map(([label, href], index) => (
            <a
              key={label}
              href={href}
              className={`block border-l-2 px-4 py-3 ${index === 0 ? "border-[#e0b56d] bg-white/10 text-white" : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-7 left-5 right-5 border-t border-white/15 pt-5 text-xs text-white/45">
          Internal operations workspace
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-[#d9e1de] bg-[#f8faf9] px-6 py-5 md:px-10">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-[#648078]">OPERATIONS / OVERVIEW</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173a34]">Front desk dashboard</h1>
          </div>
          <div className="hidden items-center gap-4 text-right sm:flex">
            <div>
              <p className="text-sm font-medium">Today</p>
              <p className="text-xs text-[#71827d]">{summary ? formatDate(summary.date) : "Live property data"}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8e7e1] text-sm font-semibold text-[#173a34]">VH</div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 md:py-10">
          {state === "loading" && (
            <section className="flex min-h-[420px] items-center justify-center border border-[#d9e1de] bg-[#f8faf9]">
              <p className="text-sm text-[#648078]">Loading live property data...</p>
            </section>
          )}

          {state === "signed-out" && (
            <section className="max-w-xl border border-[#e2c58f] bg-[#fffaf0] p-8 shadow-sm">
              <p className="text-[10px] font-semibold tracking-[0.25em] text-[#9b6e2e]">STAFF ACCESS REQUIRED</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#173a34]">Sign in to the PMS</h2>
              <p className="mt-4 leading-7 text-[#5d6e68]">This workspace reads live hotel operations data from the NestJS API. A Supabase staff access token is required before dashboard figures are shown.</p>
              <a href="/" className="mt-7 inline-block bg-[#173a34] px-5 py-3 text-sm font-medium text-white hover:bg-[#102b27]">Return to website</a>
            </section>
          )}

          {state === "error" && (
            <section className="border border-[#e4b7ae] bg-[#fff7f5] p-8">
              <p className="text-[10px] font-semibold tracking-[0.25em] text-[#a24d3c]">DASHBOARD UNAVAILABLE</p>
              <h2 className="mt-4 text-2xl font-semibold text-[#552b24]">Live data could not be loaded</h2>
              <p className="mt-3 text-sm text-[#7d4d44]">{error}</p>
              <p className="mt-6 text-xs text-[#7d4d44]">API: {apiUrl}</p>
            </section>
          )}

          {state === "ready" && summary && (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {([
                  ["Arrivals", summary.arrivals.length, "Due today", "#dcece5"],
                  ["Departures", summary.departures.length, "Leaving today", "#e9e1d3"],
                  ["Current guests", summary.currentGuests.length, "In-house now", "#dce2ed"],
                  ["Available rooms", summary.availableRooms, "Ready to sell", "#dcece5"],
                  ["Maintenance", summary.maintenanceRooms, "Currently blocked", "#f1dcd7"],
                ] as const).map(([label, value, caption, color]) => (
                  <article key={label} className="border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-medium text-[#648078]">{label}</p>
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                    </div>
                    <p className="mt-5 text-3xl font-semibold tracking-tight text-[#173a34]">{value}</p>
                    <p className="mt-1 text-xs text-[#82918c]">{caption}</p>
                  </article>
                ))}
              </section>

              <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                <article className="border border-[#d9e1de] bg-[#f8faf9] shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#d9e1de] px-6 py-5">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">RESERVATION FLOW</p>
                      <h2 className="mt-2 text-xl font-semibold text-[#173a34]">Recent reservations</h2>
                    </div>
                    <a href="/pms/reservations" className="text-xs font-semibold text-[#9b6e2e] hover:underline">View all</a>
                  </div>
                  <div className="divide-y divide-[#e3e9e6]">
                    {summary.recentReservations.length === 0 && <p className="px-6 py-10 text-sm text-[#82918c]">No reservations found.</p>}
                    {summary.recentReservations.map((reservation) => (
                      <div key={reservation.id} className="grid gap-2 px-6 py-4 sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-center">
                        <div>
                          <p className="text-sm font-semibold text-[#29423d]">{reservation.guests ? `${reservation.guests.first_name} ${reservation.guests.last_name}` : "Guest profile unavailable"}</p>
                          <p className="mt-1 text-xs text-[#82918c]">{reservation.room_types?.name ?? "Room type unavailable"}</p>
                        </div>
                        <p className="text-xs text-[#648078]">{formatDate(reservation.check_in)} - {formatDate(reservation.check_out)}</p>
                        <p className="text-xs text-[#648078]">{reservation.status}</p>
                        <span className="text-xs font-semibold text-[#9b6e2e]">Open</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="border border-[#d9e1de] bg-[#173a34] p-6 text-white shadow-sm">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-white/55">FINANCIAL SNAPSHOT</p>
                  <div className="mt-8 border-b border-white/15 pb-6">
                    <p className="text-sm text-white/60">Today&apos;s revenue</p>
                    <p className="mt-2 text-3xl font-semibold">{formatCurrency(summary.todayRevenue)}</p>
                  </div>
                  <div className="pt-6">
                    <p className="text-sm text-white/60">Outstanding balances</p>
                    <p className="mt-2 text-3xl font-semibold text-[#f1cb8f]">{formatCurrency(summary.outstandingBalances)}</p>
                  </div>
                  <a href="/pms/billing" className="mt-10 inline-block border border-white/25 px-4 py-3 text-xs font-semibold text-white hover:bg-white/10">Open billing</a>
                </article>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
