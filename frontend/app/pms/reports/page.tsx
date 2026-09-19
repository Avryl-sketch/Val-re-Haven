"use client";

import { useEffect, useState } from "react";

type ReportSummary = {
  date: string;
  arrivals: Array<{ id: string; guests?: { first_name: string; last_name: string } | null; room_types?: { name: string } | null }>;
  departures: Array<{ id: string; guests?: { first_name: string; last_name: string } | null; rooms?: { room_number: string } | null }>;
  currentGuests: Array<{ id: string; guests?: { first_name: string; last_name: string } | null; rooms?: { room_number: string } | null }>;
  roomCounts: Record<string, number>;
  availableRooms: number;
  occupiedRooms: number;
  reservedRooms: number;
  dirtyRooms: number;
  maintenanceRooms: number;
  todayRevenue: number;
  outstandingBalances: number;
  recentReservations: Array<{ id: string; status: string; room_types?: { name: string } | null }>;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const navigation = [
  ["Overview", "/pms"], ["Reservations", "/pms/reservations"], ["Rooms", "/pms/rooms"],
  ["Guests", "/pms/guests"], ["Housekeeping", "/pms/housekeeping"], ["Billing & Payments", "/pms/billing"], ["Reports", "/pms/reports"],
];

function currency(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-PH", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function guestName(guest?: { first_name: string; last_name: string } | null) {
  return guest ? `${guest.first_name} ${guest.last_name}` : "Guest profile unavailable";
}

export default function PmsReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token) {
      setState("signed-out");
      return;
    }

    fetch(`${apiUrl}/dashboard/summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 401 || response.status === 403
          ? "Your staff session is not authorized for the PMS."
          : "Report data could not be loaded.");
        return response.json() as Promise<ReportSummary>;
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
        <a href="/" className="block border-b border-white/15 pb-7"><p className="text-lg font-semibold tracking-[0.14em]">VALÉRE HAVEN</p><p className="mt-2 text-[10px] tracking-[0.25em] text-white/55">PROPERTY MANAGEMENT</p></a>
        <nav className="mt-8 space-y-1 text-sm">{navigation.map(([label, href]) => <a key={label} href={href} className={`block border-l-2 px-4 py-3 ${label === "Reports" ? "border-[#e0b56d] bg-white/10 text-white" : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"}`}>{label}</a>)}</nav>
        <div className="absolute bottom-7 left-5 right-5 border-t border-white/15 pt-5 text-xs text-white/45">Internal operations workspace</div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-[#d9e1de] bg-[#f8faf9] px-6 py-5 md:px-10"><div><p className="text-[10px] font-semibold tracking-[0.25em] text-[#648078]">OPERATIONS / REPORTS</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173a34]">Daily operations report</h1></div><a href="/pms" className="text-xs font-semibold text-[#9b6e2e] hover:underline">Back to overview</a></header>

        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 md:py-10">
          {state === "loading" && <section className="flex min-h-[420px] items-center justify-center border border-[#d9e1de] bg-[#f8faf9]"><p className="text-sm text-[#648078]">Loading daily report...</p></section>}
          {state === "signed-out" && <section className="max-w-xl border border-[#e2c58f] bg-[#fffaf0] p-8 shadow-sm"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#9b6e2e]">STAFF ACCESS REQUIRED</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#173a34]">Sign in to view reports</h2><p className="mt-4 leading-7 text-[#5d6e68]">Operational reports are an internal PMS function and require a staff session.</p><a href="/pms/login" className="mt-7 inline-block bg-[#173a34] px-5 py-3 text-sm font-medium text-white">Sign in</a></section>}
          {state === "error" && <section className="border border-[#e4b7ae] bg-[#fff7f5] p-8"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#a24d3c]">REPORT UNAVAILABLE</p><h2 className="mt-4 text-2xl font-semibold text-[#552b24]">Daily report could not be loaded</h2><p className="mt-3 text-sm text-[#7d4d44]">{error}</p><p className="mt-6 text-xs text-[#7d4d44]">API: {apiUrl}</p></section>}

          {state === "ready" && summary && <>
            <section className="flex flex-col gap-2 border border-[#d9e1de] bg-[#f8faf9] p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">REPORTING DATE</p><h2 className="mt-2 text-2xl font-semibold text-[#173a34]">{date(summary.date)}</h2></div><p className="text-sm text-[#648078]">Live operational snapshot</p></section>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[["Arrivals", summary.arrivals.length], ["Departures", summary.departures.length], ["In-house guests", summary.currentGuests.length], ["Available rooms", summary.availableRooms], ["Occupied rooms", summary.occupiedRooms]].map(([label, value]) => <article key={label} className="border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm"><p className="text-xs text-[#648078]">{label}</p><p className="mt-4 text-3xl font-semibold text-[#173a34]">{value}</p></article>)}</section>

            <section className="mt-8 grid gap-6 xl:grid-cols-2"><article className="border border-[#d9e1de] bg-[#f8faf9] shadow-sm"><div className="border-b border-[#d9e1de] p-5"><p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">ARRIVALS</p><h2 className="mt-2 text-xl font-semibold text-[#173a34]">Guests arriving today</h2></div><div className="divide-y divide-[#e3e9e6]">{summary.arrivals.map((arrival) => <div key={arrival.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="text-sm font-semibold text-[#29423d]">{guestName(arrival.guests)}</p><p className="mt-1 text-xs text-[#82918c]">{arrival.room_types?.name ?? "Room type unavailable"}</p></div><span className="text-xs font-semibold text-[#9b6e2e]">Expected</span></div>)}{summary.arrivals.length === 0 && <p className="p-8 text-sm text-[#82918c]">No arrivals scheduled today.</p>}</div></article><article className="border border-[#d9e1de] bg-[#f8faf9] shadow-sm"><div className="border-b border-[#d9e1de] p-5"><p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">DEPARTURES</p><h2 className="mt-2 text-xl font-semibold text-[#173a34]">Guests departing today</h2></div><div className="divide-y divide-[#e3e9e6]">{summary.departures.map((departure) => <div key={departure.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="text-sm font-semibold text-[#29423d]">{guestName(departure.guests)}</p><p className="mt-1 text-xs text-[#82918c]">Room {departure.rooms?.room_number ?? "Unassigned"}</p></div><span className="text-xs font-semibold text-[#9b6e2e]">Due out</span></div>)}{summary.departures.length === 0 && <p className="p-8 text-sm text-[#82918c]">No departures scheduled today.</p>}</div></article></section>

            <section className="mt-8 grid gap-6 md:grid-cols-2"><article className="border border-[#d9e1de] bg-[#173a34] p-6 text-white shadow-sm"><p className="text-[10px] font-semibold tracking-[0.2em] text-white/55">FINANCIAL PULSE</p><p className="mt-7 text-sm text-white/60">Today&apos;s revenue</p><p className="mt-2 text-3xl font-semibold">{currency(summary.todayRevenue)}</p><p className="mt-6 border-t border-white/15 pt-5 text-sm text-white/60">Outstanding balances</p><p className="mt-2 text-2xl font-semibold text-[#f1cb8f]">{currency(summary.outstandingBalances)}</p></article><article className="border border-[#d9e1de] bg-[#f8faf9] p-6 shadow-sm"><p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">ROOM CONDITION</p><div className="mt-6 grid grid-cols-2 gap-4">{[["Available", summary.availableRooms], ["Reserved", summary.reservedRooms], ["Dirty", summary.dirtyRooms], ["Maintenance", summary.maintenanceRooms]].map(([label, value]) => <div key={label} className="border border-[#e3e9e6] bg-white p-4"><p className="text-xs text-[#648078]">{label}</p><p className="mt-2 text-2xl font-semibold text-[#173a34]">{value}</p></div>)}</div></article></section>
          </>}
        </div>
      </div>
    </main>
  );
}
