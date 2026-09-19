"use client";

import { useEffect, useMemo, useState } from "react";

type Room = {
  id: string;
  room_number: string;
  floor: number;
  status: string;
  notes?: string | null;
  room_types?: { name: string; price_per_night?: number | null };
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const statuses = ["AVAILABLE", "RESERVED", "OCCUPIED", "DIRTY", "CLEAN", "INSPECTION", "MAINTENANCE", "OUT_OF_SERVICE"];

const statusStyles: Record<string, string> = {
  AVAILABLE: "bg-[#dcece5] text-[#27614e]",
  CLEAN: "bg-[#dcece5] text-[#27614e]",
  RESERVED: "bg-[#e9e1d3] text-[#85652d]",
  OCCUPIED: "bg-[#dce2ed] text-[#405477]",
  DIRTY: "bg-[#f3ddd8] text-[#985044]",
  INSPECTION: "bg-[#eee3c8] text-[#8a6b2c]",
  MAINTENANCE: "bg-[#f3ddd8] text-[#985044]",
  OUT_OF_SERVICE: "bg-[#e5e7e6] text-[#596561]",
};

export default function PmsRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token) {
      setState("signed-out");
      return;
    }

    fetch(`${apiUrl}/rooms`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 403
            ? "Your staff session is not authorized for the PMS."
            : "Room inventory could not be loaded.");
        }
        return response.json() as Promise<Room[]>;
      })
      .then((data) => {
        setRooms(data);
        setState("ready");
      })
      .catch((requestError: Error) => {
        setError(requestError.message);
        setState("error");
      });
  }, []);

  const filteredRooms = useMemo(() => rooms.filter((room) => {
    const matchesSearch = room.room_number.includes(search.trim()) || room.room_types?.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === "ALL" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [rooms, search, statusFilter]);

  const floors = [...new Set(filteredRooms.map((room) => room.floor))].sort((a, b) => a - b);

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
          ].map(([label, href]) => (
            <a key={label} href={href} className={`block border-l-2 px-4 py-3 ${label === "Rooms" ? "border-[#e0b56d] bg-white/10 text-white" : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-7 left-5 right-5 border-t border-white/15 pt-5 text-xs text-white/45">Internal operations workspace</div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-[#d9e1de] bg-[#f8faf9] px-6 py-5 md:px-10">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-[#648078]">OPERATIONS / INVENTORY</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173a34]">Room inventory</h1>
          </div>
          <a href="/pms" className="text-xs font-semibold text-[#9b6e2e] hover:underline">Back to overview</a>
        </header>

        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 md:py-10">
          {state === "loading" && <section className="flex min-h-[420px] items-center justify-center border border-[#d9e1de] bg-[#f8faf9]"><p className="text-sm text-[#648078]">Loading live room inventory...</p></section>}

          {state === "signed-out" && <section className="max-w-xl border border-[#e2c58f] bg-[#fffaf0] p-8 shadow-sm"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#9b6e2e]">STAFF ACCESS REQUIRED</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#173a34]">Sign in to view rooms</h2><p className="mt-4 leading-7 text-[#5d6e68]">Room inventory is an internal PMS function and is loaded from the NestJS API.</p><a href="/" className="mt-7 inline-block bg-[#173a34] px-5 py-3 text-sm font-medium text-white">Return to website</a></section>}

          {state === "error" && <section className="border border-[#e4b7ae] bg-[#fff7f5] p-8"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#a24d3c]">INVENTORY UNAVAILABLE</p><h2 className="mt-4 text-2xl font-semibold text-[#552b24]">Room data could not be loaded</h2><p className="mt-3 text-sm text-[#7d4d44]">{error}</p><p className="mt-6 text-xs text-[#7d4d44]">API: {apiUrl}</p></section>}

          {state === "ready" && (
            <>
              <section className="flex flex-col gap-5 border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">56 PHYSICAL ROOMS</p>
                  <h2 className="mt-2 text-xl font-semibold text-[#173a34]">Floor-by-floor inventory</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search room or type" className="border border-[#cbd8d3] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#173a34]" />
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="border border-[#cbd8d3] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#173a34]">
                    <option value="ALL">All statuses</option>
                    {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                  </select>
                </div>
              </section>

              <section className="mt-6 flex flex-wrap gap-2">
                {statuses.map((status) => <span key={status} className={`px-3 py-1.5 text-[11px] font-semibold tracking-wide ${statusStyles[status]}`}>{status.replaceAll("_", " ")}</span>)}
              </section>

              <div className="mt-8 space-y-8">
                {floors.map((floor) => (
                  <section key={floor}>
                    <div className="mb-3 flex items-center gap-3"><h2 className="text-sm font-semibold tracking-[0.12em] text-[#42615a]">{floor}TH FLOOR</h2><span className="h-px flex-1 bg-[#d6e0dc]" /></div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {filteredRooms.filter((room) => room.floor === floor).map((room) => (
                        <article key={room.id} className="border border-[#d9e1de] bg-[#f8faf9] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                          <div className="flex items-start justify-between gap-3"><p className="text-2xl font-semibold tracking-tight text-[#173a34]">{room.room_number}</p><span className={`px-2 py-1 text-[10px] font-semibold ${statusStyles[room.status] ?? "bg-[#e5e7e6] text-[#596561]"}`}>{room.status.replaceAll("_", " ")}</span></div>
                          <p className="mt-4 text-sm font-medium text-[#42615a]">{room.room_types?.name ?? "Room type unavailable"}</p>
                          {room.notes && <p className="mt-2 text-xs leading-5 text-[#82918c]">{room.notes}</p>}
                          <button type="button" className="mt-5 border-t border-[#e3e9e6] pt-3 text-xs font-semibold text-[#9b6e2e] hover:underline">View room details</button>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
                {filteredRooms.length === 0 && <section className="border border-dashed border-[#cbd8d3] bg-[#f8faf9] p-12 text-center text-sm text-[#82918c]">No rooms match the current filters.</section>}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
