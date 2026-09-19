"use client";

import { useEffect, useMemo, useState } from "react";

type HousekeepingRoom = {
  id: string;
  room_number: string;
  floor: number;
  status: "DIRTY" | "CLEAN" | "INSPECTION";
  room_types?: { name: string } | null;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const statuses = ["ALL", "DIRTY", "CLEAN", "INSPECTION"] as const;
const navigation = [
  ["Overview", "/pms"],
  ["Reservations", "/pms/reservations"],
  ["Rooms", "/pms/rooms"],
  ["Guests", "/pms/guests"],
  ["Housekeeping", "/pms/housekeeping"],
  ["Billing & Payments", "/pms/billing"],
  ["Reports", "/pms/reports"],
];

const statusStyles: Record<string, string> = {
  DIRTY: "bg-[#f3ddd8] text-[#985044]",
  CLEAN: "bg-[#dcece5] text-[#27614e]",
  INSPECTION: "bg-[#eee3c8] text-[#8a6b2c]",
};

export default function PmsHousekeepingPage() {
  const [rooms, setRooms] = useState<HousekeepingRoom[]>([]);
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("ALL");
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  async function loadRooms() {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token) {
      setState("signed-out");
      return;
    }

    const response = await fetch(`${apiUrl}/housekeeping/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(response.status === 401 || response.status === 403
        ? "Your staff session is not authorized for the PMS."
        : "Housekeeping data could not be loaded.");
    }
    setRooms(await response.json() as HousekeepingRoom[]);
    setState("ready");
  }

  useEffect(() => {
    loadRooms().catch((requestError: Error) => {
      setError(requestError.message);
      setState("error");
    });
  }, []);

  async function updateStatus(room: HousekeepingRoom, status: HousekeepingRoom["status"]) {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token) {
      setState("signed-out");
      return;
    }

    setUpdatingId(room.id);
    setError("");
    try {
      const response = await fetch(`${apiUrl}/housekeeping/rooms/${room.id}/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("The room status could not be updated.");
      await loadRooms();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The room status could not be updated.");
    } finally {
      setUpdatingId("");
    }
  }

  const filteredRooms = useMemo(
    () => statusFilter === "ALL" ? rooms : rooms.filter((room) => room.status === statusFilter),
    [rooms, statusFilter],
  );

  return (
    <main className="min-h-screen bg-[#eef1f0] text-[#172522]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#d9e1de] bg-[#173a34] px-5 py-7 text-white lg:block">
        <a href="/" className="block border-b border-white/15 pb-7"><p className="text-lg font-semibold tracking-[0.14em]">VALÉRE HAVEN</p><p className="mt-2 text-[10px] tracking-[0.25em] text-white/55">PROPERTY MANAGEMENT</p></a>
        <nav className="mt-8 space-y-1 text-sm">{navigation.map(([label, href]) => <a key={label} href={href} className={`block border-l-2 px-4 py-3 ${label === "Housekeeping" ? "border-[#e0b56d] bg-white/10 text-white" : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"}`}>{label}</a>)}</nav>
        <div className="absolute bottom-7 left-5 right-5 border-t border-white/15 pt-5 text-xs text-white/45">Internal operations workspace</div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-[#d9e1de] bg-[#f8faf9] px-6 py-5 md:px-10"><div><p className="text-[10px] font-semibold tracking-[0.25em] text-[#648078]">OPERATIONS / HOUSEKEEPING</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173a34]">Room readiness</h1></div><a href="/pms" className="text-xs font-semibold text-[#9b6e2e] hover:underline">Back to overview</a></header>

        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 md:py-10">
          {state === "loading" && <section className="flex min-h-[420px] items-center justify-center border border-[#d9e1de] bg-[#f8faf9]"><p className="text-sm text-[#648078]">Loading housekeeping board...</p></section>}
          {state === "signed-out" && <section className="max-w-xl border border-[#e2c58f] bg-[#fffaf0] p-8 shadow-sm"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#9b6e2e]">STAFF ACCESS REQUIRED</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#173a34]">Sign in to manage rooms</h2><p className="mt-4 leading-7 text-[#5d6e68]">Housekeeping updates are an internal PMS function and require a staff session.</p><a href="/pms/login" className="mt-7 inline-block bg-[#173a34] px-5 py-3 text-sm font-medium text-white">Sign in</a></section>}
          {state === "error" && <section className="border border-[#e4b7ae] bg-[#fff7f5] p-8"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#a24d3c]">HOUSEKEEPING UNAVAILABLE</p><h2 className="mt-4 text-2xl font-semibold text-[#552b24]">Room readiness could not be loaded</h2><p className="mt-3 text-sm text-[#7d4d44]">{error}</p><p className="mt-6 text-xs text-[#7d4d44]">API: {apiUrl}</p></section>}

          {state === "ready" && <section className="border border-[#d9e1de] bg-[#f8faf9] shadow-sm">
            <div className="flex flex-col gap-5 border-b border-[#d9e1de] p-5 md:flex-row md:items-center md:justify-between"><div><p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">{filteredRooms.length} ROOMS</p><h2 className="mt-2 text-xl font-semibold text-[#173a34]">Housekeeping board</h2></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as (typeof statuses)[number])} className="border border-[#cbd8d3] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#173a34]">{statuses.map((status) => <option key={status} value={status}>{status === "ALL" ? "All housekeeping statuses" : status}</option>)}</select></div>
            {error && <p className="border-b border-[#e4b7ae] bg-[#fff7f5] px-5 py-3 text-sm text-[#a24d3c]">{error}</p>}
            <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">{filteredRooms.map((room) => <article key={room.id} className="border border-[#d9e1de] bg-white p-5"><div className="flex items-start justify-between gap-3"><p className="text-2xl font-semibold tracking-tight text-[#173a34]">{room.room_number}</p><span className={`px-2 py-1 text-[10px] font-semibold ${statusStyles[room.status]}`}>{room.status}</span></div><p className="mt-3 text-sm text-[#42615a]">{room.room_types?.name ?? "Room type unavailable"}</p><p className="mt-1 text-xs text-[#82918c]">Floor {room.floor}</p><div className="mt-5 grid grid-cols-3 gap-1">{statuses.slice(1).map((status) => <button key={status} type="button" disabled={updatingId === room.id || status === room.status} onClick={() => updateStatus(room, status as HousekeepingRoom["status"])} className={`px-1 py-2 text-[10px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${statusStyles[status]}`}>{status}</button>)}</div></article>)}</div>
            {filteredRooms.length === 0 && <p className="p-12 text-center text-sm text-[#82918c]">No rooms match the selected status.</p>}
          </section>}
        </div>
      </div>
    </main>
  );
}
