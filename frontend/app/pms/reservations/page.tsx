"use client";

import { useEffect, useMemo, useState } from "react";

type Reservation = {
  id: string;
  room_id: string | null;
  room_type_id: string;
  check_in: string;
  check_out: string;
  number_of_guests: number;
  status: string;
  payment_status: string;
  total_amount: number | null;
  booking_type?: string;
  notes?: string | null;
  special_requests?: string | null;
  guests?: { first_name: string; last_name: string; email?: string } | null;
  rooms?: { room_number: string } | null;
  room_types?: { name: string } | null;
};

type AvailableRoom = {
  id: string;
  room_number: string;
  floor: number;
  status: string;
  room_types?: { name: string } | null;
};

type Payment = {
  amount: number;
  status: string;
  method: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const statuses = ["ALL", "PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "NO_SHOW"];

const statusStyles: Record<string, string> = {
  PENDING: "bg-[#eee3c8] text-[#8a6b2c]",
  CONFIRMED: "bg-[#dcece5] text-[#27614e]",
  CHECKED_IN: "bg-[#dce2ed] text-[#405477]",
  CHECKED_OUT: "bg-[#e5e7e6] text-[#596561]",
  CANCELLED: "bg-[#f3ddd8] text-[#985044]",
  NO_SHOW: "bg-[#f3ddd8] text-[#985044]",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export default function PmsReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [editValues, setEditValues] = useState({ checkIn: "", checkOut: "", numberOfGuests: "", bookingType: "INDIVIDUAL", notes: "", specialRequests: "" });

  async function loadReservations() {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token) {
      queueMicrotask(() => setState("signed-out"));
      return;
    }

    const response = await fetch(`${apiUrl}/reservations`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error("Reservations could not be loaded.");
    setReservations(await response.json() as Reservation[]);
    setState("ready");
  }

  useEffect(() => {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token) {
      queueMicrotask(() => setState("signed-out"));
      return;
    }

    queueMicrotask(() => {
      loadReservations().catch((requestError: Error) => {
        setError(requestError.message);
        setState("error");
      });
    });
  }, []);

  async function manageReservation(reservation: Reservation) {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token) return setState("signed-out");
    setSelectedId(reservation.id);
    setActionError("");
    setEditValues({
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      numberOfGuests: String(reservation.number_of_guests),
      bookingType: reservation.booking_type ?? "INDIVIDUAL",
      notes: reservation.notes ?? "",
      specialRequests: reservation.special_requests ?? "",
    });
    try {
      const [roomsResponse, paymentsResponse] = await Promise.all([
        fetch(`${apiUrl}/reservations/${reservation.id}/available-rooms`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/payments/reservation/${reservation.id}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!roomsResponse.ok || !paymentsResponse.ok) throw new Error("Reservation details could not be loaded.");
      const roomData = await roomsResponse.json() as { rooms: AvailableRoom[] };
      const paymentData = await paymentsResponse.json() as Payment[];
      setAvailableRooms(roomData.rooms);
      setPayments(paymentData);
      const successfulTotal = paymentData
        .filter((payment) => payment.status === "SUCCEEDED")
        .reduce((total, payment) => total + Number(payment.amount), 0);
      setPaymentAmount(String(Math.max(0, Number(reservation.total_amount ?? 0) - successfulTotal)));
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Reservation details could not be loaded.");
    }
  }

  async function performAction(path: string, options: RequestInit = {}) {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token || !selectedId) return;
    setActionLoading(true);
    setActionError("");
    try {
      const response = await fetch(`${apiUrl}/reservations/${selectedId}${path}`, {
        ...options,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(options.headers ?? {}) },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(body?.message ?? "Reservation action could not be completed.");
      }
      await loadReservations();
      const updated = reservations.find((reservation) => reservation.id === selectedId);
      if (updated) await manageReservation(updated);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Reservation action could not be completed.");
    } finally {
      setActionLoading(false);
    }
  }

  async function recordPayment() {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token || !selectedId || Number(paymentAmount) <= 0) return;
    setActionLoading(true);
    setActionError("");
    try {
      const response = await fetch(`${apiUrl}/payments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: selectedId, amount: Number(paymentAmount), method: "CASH", status: "SUCCEEDED" }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(body?.message ?? "Payment could not be recorded.");
      }
      const reservation = reservations.find((item) => item.id === selectedId);
      if (reservation) await manageReservation(reservation);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Payment could not be recorded.");
    } finally {
      setActionLoading(false);
    }
  }

  async function saveEdits() {
    await performAction("", {
      method: "PATCH",
      body: JSON.stringify({
        checkIn: editValues.checkIn,
        checkOut: editValues.checkOut,
        numberOfGuests: Number(editValues.numberOfGuests),
        bookingType: editValues.bookingType,
        notes: editValues.notes || undefined,
        specialRequests: editValues.specialRequests || undefined,
      }),
    });
  }

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reservations.filter((reservation) => {
      const guestName = reservation.guests
        ? `${reservation.guests.first_name} ${reservation.guests.last_name}`
        : "";
      const matchesSearch = !query || [
        reservation.id,
        guestName,
        reservation.guests?.email ?? "",
        reservation.room_types?.name ?? "",
        reservation.rooms?.room_number ?? "",
      ].some((value) => value.toLowerCase().includes(query));
      const matchesStatus = statusFilter === "ALL" || reservation.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, search, statusFilter]);

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
            <a key={label} href={href} className={`block border-l-2 px-4 py-3 ${label === "Reservations" ? "border-[#e0b56d] bg-white/10 text-white" : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-7 left-5 right-5 border-t border-white/15 pt-5 text-xs text-white/45">Internal operations workspace</div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-[#d9e1de] bg-[#f8faf9] px-6 py-5 md:px-10">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-[#648078]">OPERATIONS / RESERVATIONS</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173a34]">Reservation flow</h1>
          </div>
          <a href="/pms" className="text-xs font-semibold text-[#9b6e2e] hover:underline">Back to overview</a>
        </header>

        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 md:py-10">
          {state === "loading" && <section className="flex min-h-[420px] items-center justify-center border border-[#d9e1de] bg-[#f8faf9]"><p className="text-sm text-[#648078]">Loading live reservations...</p></section>}

          {state === "signed-out" && <section className="max-w-xl border border-[#e2c58f] bg-[#fffaf0] p-8 shadow-sm"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#9b6e2e]">STAFF ACCESS REQUIRED</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#173a34]">Sign in to view reservations</h2><p className="mt-4 leading-7 text-[#5d6e68]">Reservations are an internal PMS function and are loaded from the NestJS API.</p><a href="/pms/login" className="mt-7 inline-block bg-[#173a34] px-5 py-3 text-sm font-medium text-white">Sign in</a></section>}

          {state === "error" && <section className="border border-[#e4b7ae] bg-[#fff7f5] p-8"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#a24d3c]">RESERVATIONS UNAVAILABLE</p><h2 className="mt-4 text-2xl font-semibold text-[#552b24]">Reservation data could not be loaded</h2><p className="mt-3 text-sm text-[#7d4d44]">{error}</p><p className="mt-6 text-xs text-[#7d4d44]">API: {apiUrl}</p></section>}

          {state === "ready" && (
            <section className="border border-[#d9e1de] bg-[#f8faf9] shadow-sm">
              <div className="flex flex-col gap-5 border-b border-[#d9e1de] p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">{filteredReservations.length} RECORDS</p>
                  <h2 className="mt-2 text-xl font-semibold text-[#173a34]">All reservations</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search guest, room, or ID" className="border border-[#cbd8d3] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#173a34]" />
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="border border-[#cbd8d3] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#173a34]">
                    {statuses.map((status) => <option key={status} value={status}>{status === "ALL" ? "All statuses" : status.replaceAll("_", " ")}</option>)}
                  </select>
                </div>
              </div>

              <div className="divide-y divide-[#e3e9e6]">
                {filteredReservations.map((reservation) => (
                  <article key={reservation.id} className="grid gap-4 px-5 py-5 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center md:px-6">
                    <div>
                      <p className="text-sm font-semibold text-[#29423d]">{reservation.guests ? `${reservation.guests.first_name} ${reservation.guests.last_name}` : "Guest profile unavailable"}</p>
                      <p className="mt-1 text-xs text-[#82918c]">{reservation.guests?.email ?? reservation.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#42615a]">{reservation.room_types?.name ?? "Room type unavailable"}</p>
                      <p className="mt-1 text-xs text-[#82918c]">Room {reservation.rooms?.room_number ?? "Unassigned"} · {reservation.number_of_guests} guests</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#648078]">{formatDate(reservation.check_in)} - {formatDate(reservation.check_out)}</p>
                      <p className="mt-1 text-xs font-medium text-[#42615a]">{formatCurrency(reservation.total_amount)} · {reservation.payment_status.replaceAll("_", " ")}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <span className={`w-fit px-2.5 py-1.5 text-[10px] font-semibold ${statusStyles[reservation.status] ?? "bg-[#e5e7e6] text-[#596561]"}`}>{reservation.status.replaceAll("_", " ")}</span>
                      <button type="button" onClick={() => manageReservation(reservation)} className="text-xs font-semibold text-[#9b6e2e] hover:underline">Manage</button>
                    </div>
                  </article>
                ))}
                {filteredReservations.length === 0 && <p className="p-12 text-center text-sm text-[#82918c]">No reservations match the current filters.</p>}
              </div>

              {selectedId && (() => {
                const reservation = reservations.find((item) => item.id === selectedId);
                if (!reservation) return null;
                const paid = payments.filter((payment) => payment.status === "SUCCEEDED").reduce((total, payment) => total + Number(payment.amount), 0);
                const outstanding = Math.max(0, Number(reservation.total_amount ?? 0) - paid);
                return (
                  <section className="border-t border-[#d9e1de] bg-[#f1f5f3] p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">RESERVATION ACTIONS</p>
                        <h3 className="mt-2 text-xl font-semibold text-[#173a34]">{reservation.guests ? `${reservation.guests.first_name} ${reservation.guests.last_name}` : "Guest profile unavailable"}</h3>
                        <p className="mt-1 text-sm text-[#648078]">{reservation.room_types?.name ?? "Room type unavailable"} · {reservation.status.replaceAll("_", " ")}</p>
                      </div>
                      <button type="button" onClick={() => setSelectedId("")} className="text-xs font-semibold text-[#648078] hover:underline">Close</button>
                    </div>

                    {actionError && <p className="mt-5 border border-[#e4b7ae] bg-[#fff7f5] px-4 py-3 text-sm text-[#a24d3c]">{actionError}</p>}

                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                      <div className="border border-[#d9e1de] bg-white p-5 lg:col-span-2">
                        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">EDIT RESERVATION</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs text-[#648078]">Check-in<input type="date" value={editValues.checkIn} onChange={(event) => setEditValues({ ...editValues, checkIn: event.target.value })} className="mt-2 w-full border border-[#cbd8d3] px-3 py-2 text-sm" /></label><label className="text-xs text-[#648078]">Check-out<input type="date" value={editValues.checkOut} onChange={(event) => setEditValues({ ...editValues, checkOut: event.target.value })} className="mt-2 w-full border border-[#cbd8d3] px-3 py-2 text-sm" /></label><label className="text-xs text-[#648078]">Guests<input type="number" min="1" value={editValues.numberOfGuests} onChange={(event) => setEditValues({ ...editValues, numberOfGuests: event.target.value })} className="mt-2 w-full border border-[#cbd8d3] px-3 py-2 text-sm" /></label><label className="text-xs text-[#648078]">Booking type<select value={editValues.bookingType} onChange={(event) => setEditValues({ ...editValues, bookingType: event.target.value })} className="mt-2 w-full border border-[#cbd8d3] bg-white px-3 py-2 text-sm"><option value="INDIVIDUAL">Individual</option><option value="GROUP">Group</option><option value="CORPORATE">Corporate</option></select></label></div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs text-[#648078]">Notes<textarea rows={3} value={editValues.notes} onChange={(event) => setEditValues({ ...editValues, notes: event.target.value })} className="mt-2 w-full resize-none border border-[#cbd8d3] px-3 py-2 text-sm" /></label><label className="text-xs text-[#648078]">Special requests<textarea rows={3} value={editValues.specialRequests} onChange={(event) => setEditValues({ ...editValues, specialRequests: event.target.value })} className="mt-2 w-full resize-none border border-[#cbd8d3] px-3 py-2 text-sm" /></label></div>
                        <button type="button" onClick={saveEdits} disabled={actionLoading} className="mt-4 bg-[#173a34] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Save reservation changes</button>
                      </div>
                      <div className="border border-[#d9e1de] bg-white p-5">
                        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">ROOM ASSIGNMENT</p>
                        <p className="mt-3 text-sm text-[#42615a]">Current room: {reservation.rooms?.room_number ?? "Unassigned"}</p>
                        <select defaultValue="" onChange={(event) => event.target.value && performAction("/room", { method: "PATCH", body: JSON.stringify({ roomId: event.target.value }) })} disabled={actionLoading || availableRooms.length === 0} className="mt-4 w-full border border-[#cbd8d3] bg-white px-4 py-3 text-sm outline-none focus:border-[#173a34]"><option value="">Assign an available room</option>{availableRooms.map((room) => <option key={room.id} value={room.id}>Room {room.room_number} · Floor {room.floor} · {room.status}</option>)}</select>
                        {availableRooms.length === 0 && <p className="mt-3 text-xs text-[#82918c]">No matching rooms are available for these dates.</p>}
                      </div>

                      <div className="border border-[#d9e1de] bg-white p-5">
                        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">PAYMENT & STAY</p>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-[#82918c]">Charges</p><p className="mt-1 font-semibold text-[#29423d]">{formatCurrency(reservation.total_amount)}</p></div><div><p className="text-xs text-[#82918c]">Outstanding</p><p className="mt-1 font-semibold text-[#29423d]">{formatCurrency(outstanding)}</p></div></div>
                        {reservation.status === "CHECKED_IN" && outstanding > 0 && <div className="mt-5 flex gap-2"><input type="number" min="0.01" step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} className="min-w-0 flex-1 border border-[#cbd8d3] px-3 py-2 text-sm outline-none" /><button type="button" onClick={recordPayment} disabled={actionLoading || Number(paymentAmount) <= 0} className="bg-[#173a34] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Record cash payment</button></div>}
                        <div className="mt-5 flex flex-wrap gap-2">{reservation.status === "PENDING" && <button type="button" onClick={() => performAction("", { method: "PATCH", body: JSON.stringify({ status: "CONFIRMED" }) })} disabled={actionLoading} className="bg-[#173a34] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Confirm reservation</button>}{reservation.status === "CONFIRMED" && <button type="button" onClick={() => performAction("/check-in", { method: "POST", body: JSON.stringify({ roomId: reservation.room_id ?? undefined }) })} disabled={actionLoading} className="bg-[#173a34] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Check in</button>}{reservation.status === "CHECKED_IN" && <button type="button" onClick={() => performAction("/check-out", { method: "POST" })} disabled={actionLoading || outstanding > 0} className="bg-[#9b6e2e] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Check out</button>}</div>
                      </div>
                    </div>
                  </section>
                );
              })()}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
