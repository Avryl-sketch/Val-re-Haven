"use client";

import { useEffect, useMemo, useState } from "react";

type Payment = {
  id: string;
  reservation_id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  reservations?: {
    total_amount: number;
    deposit_amount: number;
    guests?: { first_name: string; last_name: string } | null;
    room_types?: { name: string } | null;
  } | null;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const navigation = [
  ["Overview", "/pms"], ["Reservations", "/pms/reservations"], ["Rooms", "/pms/rooms"],
  ["Guests", "/pms/guests"], ["Housekeeping", "/pms/housekeeping"], ["Billing & Payments", "/pms/billing"], ["Reports", "/pms/reports"],
];
const statusStyles: Record<string, string> = {
  SUCCEEDED: "bg-[#dcece5] text-[#27614e]",
  PENDING: "bg-[#eee3c8] text-[#8a6b2c]",
  FAILED: "bg-[#f3ddd8] text-[#985044]",
  REFUNDED: "bg-[#e5e7e6] text-[#596561]",
};

function formatCurrency(value: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency, maximumFractionDigits: 0 }).format(value ?? 0);
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(new Date(value)) : "Not settled";
}

export default function PmsPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token) {
      queueMicrotask(() => setState("signed-out"));
      return;
    }
    fetch(`${apiUrl}/payments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "Your staff session is not authorized for the PMS." : "Payments could not be loaded.");
        return response.json() as Promise<Payment[]>;
      })
      .then((data) => { setPayments(data); setState("ready"); })
      .catch((requestError: Error) => { setError(requestError.message); setState("error"); });
  }, []);

  const visiblePayments = useMemo(() => filter === "ALL" ? payments : payments.filter((payment) => payment.status === filter), [payments, filter]);
  const succeeded = payments.filter((payment) => payment.status === "SUCCEEDED").reduce((total, payment) => total + Number(payment.amount), 0);
  const pending = payments.filter((payment) => payment.status === "PENDING").reduce((total, payment) => total + Number(payment.amount), 0);

  return (
    <main className="min-h-screen bg-[#eef1f0] text-[#172522]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#d9e1de] bg-[#173a34] px-5 py-7 text-white lg:block"><a href="/" className="block border-b border-white/15 pb-7"><p className="text-lg font-semibold tracking-[0.14em]">VALÉRE HAVEN</p><p className="mt-2 text-[10px] tracking-[0.25em] text-white/55">PROPERTY MANAGEMENT</p></a><nav className="mt-8 space-y-1 text-sm">{navigation.map(([label, href]) => <a key={label} href={href} className={`block border-l-2 px-4 py-3 ${label === "Billing & Payments" ? "border-[#e0b56d] bg-white/10 text-white" : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"}`}>{label}</a>)}<a href="/pms/payments" className="block border-l-2 border-[#e0b56d] bg-white/10 px-4 py-3 text-white">Payments ledger</a></nav><div className="absolute bottom-7 left-5 right-5 border-t border-white/15 pt-5 text-xs text-white/45">Internal operations workspace</div></aside>
      <div className="lg:pl-64"><header className="flex items-center justify-between border-b border-[#d9e1de] bg-[#f8faf9] px-6 py-5 md:px-10"><div><p className="text-[10px] font-semibold tracking-[0.25em] text-[#648078]">OPERATIONS / FINANCE</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173a34]">Payments ledger</h1></div><a href="/pms/billing" className="text-xs font-semibold text-[#9b6e2e] hover:underline">Back to billing</a></header>
        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 md:py-10">
          {state === "loading" && <section className="flex min-h-[420px] items-center justify-center border border-[#d9e1de] bg-[#f8faf9]"><p className="text-sm text-[#648078]">Loading payment records...</p></section>}
          {state === "signed-out" && <section className="max-w-xl border border-[#e2c58f] bg-[#fffaf0] p-8"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#9b6e2e]">STAFF ACCESS REQUIRED</p><h2 className="mt-4 text-3xl font-semibold text-[#173a34]">Sign in to view payments</h2><a href="/pms/login" className="mt-7 inline-block bg-[#173a34] px-5 py-3 text-sm font-medium text-white">Sign in</a></section>}
          {state === "error" && <section className="border border-[#e4b7ae] bg-[#fff7f5] p-8"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#a24d3c]">PAYMENTS UNAVAILABLE</p><h2 className="mt-4 text-2xl font-semibold text-[#552b24]">Payment data could not be loaded</h2><p className="mt-3 text-sm text-[#7d4d44]">{error}</p><p className="mt-6 text-xs text-[#7d4d44]">API: {apiUrl}</p></section>}
          {state === "ready" && <><section className="grid gap-4 sm:grid-cols-3"><article className="border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm"><p className="text-xs text-[#648078]">Settled value</p><p className="mt-4 text-3xl font-semibold text-[#173a34]">{formatCurrency(succeeded)}</p></article><article className="border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm"><p className="text-xs text-[#648078]">Pending value</p><p className="mt-4 text-3xl font-semibold text-[#173a34]">{formatCurrency(pending)}</p></article><article className="border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm"><p className="text-xs text-[#648078]">Records</p><p className="mt-4 text-3xl font-semibold text-[#173a34]">{payments.length}</p></article></section><section className="mt-8 border border-[#d9e1de] bg-[#f8faf9] shadow-sm"><div className="flex flex-col gap-5 border-b border-[#d9e1de] p-5 md:flex-row md:items-center md:justify-between"><div><p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">{visiblePayments.length} RECORDS</p><h2 className="mt-2 text-xl font-semibold text-[#173a34]">Payment transactions</h2></div><select value={filter} onChange={(event) => setFilter(event.target.value)} className="border border-[#cbd8d3] bg-white px-4 py-2.5 text-sm outline-none"><option value="ALL">All statuses</option><option value="SUCCEEDED">Succeeded</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option><option value="REFUNDED">Refunded</option></select></div><div className="divide-y divide-[#e3e9e6]">{visiblePayments.map((payment) => <article key={payment.id} className="grid gap-4 px-5 py-5 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto] md:items-center md:px-6"><div><p className="text-sm font-semibold text-[#29423d]">{payment.reservations?.guests ? `${payment.reservations.guests.first_name} ${payment.reservations.guests.last_name}` : "Guest profile unavailable"}</p><p className="mt-1 text-xs text-[#82918c]">Reservation {payment.reservation_id.slice(0, 8).toUpperCase()} · {payment.reservations?.room_types?.name ?? "Room type unavailable"}</p></div><div><p className="text-sm font-semibold text-[#42615a]">{formatCurrency(Number(payment.amount), payment.currency)}</p><p className="mt-1 text-xs text-[#82918c]">{payment.method.replaceAll("_", " ")}</p></div><div><p className="text-xs text-[#648078]">Deposit recorded</p><p className="mt-1 text-xs text-[#82918c]">{formatCurrency(Number(payment.reservations?.deposit_amount ?? 0))}</p></div><div><p className="text-xs text-[#648078]">{formatDate(payment.paid_at ?? payment.created_at)}</p><p className="mt-1 text-xs text-[#82918c]">Reservation total {formatCurrency(Number(payment.reservations?.total_amount ?? 0))}</p></div><span className={`w-fit px-2.5 py-1.5 text-[10px] font-semibold ${statusStyles[payment.status] ?? "bg-[#e5e7e6] text-[#596561]"}`}>{payment.status}</span></article>)}{visiblePayments.length === 0 && <p className="p-12 text-center text-sm text-[#82918c]">No payment records found.</p>}</div></section></>}
        </div>
      </div>
    </main>
  );
}
