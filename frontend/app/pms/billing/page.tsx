"use client";

import { useEffect, useMemo, useState } from "react";

type Invoice = {
  id: string;
  reservation_id: string;
  currency: string;
  subtotal: number;
  total_amount: number;
  balance_amount: number;
  status: string;
  created_at: string;
  invoice_items?: Array<{ id: string; description: string; amount: number }>;
};

type Payment = {
  id: string;
  reservation_id: string;
  amount: number;
  currency: string;
  method: string | null;
  status: string;
  created_at: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const invoiceStatuses = ["ALL", "OPEN", "PARTIALLY_PAID", "PAID", "VOID"];
const navigation = [
  ["Overview", "/pms"], ["Reservations", "/pms/reservations"], ["Rooms", "/pms/rooms"],
  ["Guests", "/pms/guests"], ["Housekeeping", "/pms/housekeeping"], ["Billing & Payments", "/pms/billing"], ["Reports", "/pms/reports"],
];
const statusStyles: Record<string, string> = {
  OPEN: "bg-[#eee3c8] text-[#8a6b2c]",
  PARTIALLY_PAID: "bg-[#dce2ed] text-[#405477]",
  PAID: "bg-[#dcece5] text-[#27614e]",
  VOID: "bg-[#e5e7e6] text-[#596561]",
  SUCCEEDED: "bg-[#dcece5] text-[#27614e]",
  PENDING: "bg-[#eee3c8] text-[#8a6b2c]",
  FAILED: "bg-[#f3ddd8] text-[#985044]",
};

function currency(value: number, code = "PHP") {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(value ?? 0);
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function PmsBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token) {
      setState("signed-out");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${apiUrl}/billing/invoices`, { headers }).then(async (response) => {
        if (!response.ok) throw new Error("Invoices could not be loaded.");
        return response.json() as Promise<Invoice[]>;
      }),
      fetch(`${apiUrl}/payments`, { headers }).then(async (response) => {
        if (!response.ok) throw new Error("Payments could not be loaded.");
        return response.json() as Promise<Payment[]>;
      }),
    ]).then(([invoiceData, paymentData]) => {
      setInvoices(invoiceData);
      setPayments(paymentData);
      setState("ready");
    }).catch((requestError: Error) => {
      setError(requestError.message);
      setState("error");
    });
  }, []);

  const filteredInvoices = useMemo(
    () => statusFilter === "ALL" ? invoices : invoices.filter((invoice) => invoice.status === statusFilter),
    [invoices, statusFilter],
  );
  const outstanding = invoices.reduce((total, invoice) => total + Number(invoice.balance_amount ?? 0), 0);
  const collected = payments.filter((payment) => payment.status === "SUCCEEDED").reduce((total, payment) => total + Number(payment.amount ?? 0), 0);

  return (
    <main className="min-h-screen bg-[#eef1f0] text-[#172522]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#d9e1de] bg-[#173a34] px-5 py-7 text-white lg:block">
        <a href="/" className="block border-b border-white/15 pb-7"><p className="text-lg font-semibold tracking-[0.14em]">VALÉRE HAVEN</p><p className="mt-2 text-[10px] tracking-[0.25em] text-white/55">PROPERTY MANAGEMENT</p></a>
        <nav className="mt-8 space-y-1 text-sm">{navigation.map(([label, href]) => <a key={label} href={href} className={`block border-l-2 px-4 py-3 ${label === "Billing & Payments" ? "border-[#e0b56d] bg-white/10 text-white" : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"}`}>{label}</a>)}</nav>
        <div className="absolute bottom-7 left-5 right-5 border-t border-white/15 pt-5 text-xs text-white/45">Internal operations workspace</div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-[#d9e1de] bg-[#f8faf9] px-6 py-5 md:px-10"><div><p className="text-[10px] font-semibold tracking-[0.25em] text-[#648078]">OPERATIONS / FINANCE</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173a34]">Billing & payments</h1></div><a href="/pms" className="text-xs font-semibold text-[#9b6e2e] hover:underline">Back to overview</a></header>

        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 md:py-10">
          {state === "loading" && <section className="flex min-h-[420px] items-center justify-center border border-[#d9e1de] bg-[#f8faf9]"><p className="text-sm text-[#648078]">Loading finance records...</p></section>}
          {state === "signed-out" && <section className="max-w-xl border border-[#e2c58f] bg-[#fffaf0] p-8 shadow-sm"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#9b6e2e]">STAFF ACCESS REQUIRED</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#173a34]">Sign in to view billing</h2><p className="mt-4 leading-7 text-[#5d6e68]">Financial records are an internal PMS function and require a staff session.</p><a href="/pms/login" className="mt-7 inline-block bg-[#173a34] px-5 py-3 text-sm font-medium text-white">Sign in</a></section>}
          {state === "error" && <section className="border border-[#e4b7ae] bg-[#fff7f5] p-8"><p className="text-[10px] font-semibold tracking-[0.25em] text-[#a24d3c]">FINANCE UNAVAILABLE</p><h2 className="mt-4 text-2xl font-semibold text-[#552b24]">Billing data could not be loaded</h2><p className="mt-3 text-sm text-[#7d4d44]">{error}</p><p className="mt-6 text-xs text-[#7d4d44]">API: {apiUrl}</p></section>}

          {state === "ready" && <>
            <section className="grid gap-4 sm:grid-cols-3"><article className="border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm"><p className="text-xs text-[#648078]">Outstanding balance</p><p className="mt-4 text-3xl font-semibold text-[#173a34]">{currency(outstanding)}</p></article><article className="border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm"><p className="text-xs text-[#648078]">Successful payments</p><p className="mt-4 text-3xl font-semibold text-[#173a34]">{currency(collected)}</p></article><article className="border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm"><p className="text-xs text-[#648078]">Open invoices</p><p className="mt-4 text-3xl font-semibold text-[#173a34]">{invoices.filter((invoice) => invoice.status === "OPEN").length}</p></article></section>

            <section className="mt-8 border border-[#d9e1de] bg-[#f8faf9] shadow-sm"><div className="flex flex-col gap-5 border-b border-[#d9e1de] p-5 md:flex-row md:items-center md:justify-between"><div><p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">{filteredInvoices.length} RECORDS</p><h2 className="mt-2 text-xl font-semibold text-[#173a34]">Invoices</h2></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="border border-[#cbd8d3] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#173a34]">{invoiceStatuses.map((status) => <option key={status} value={status}>{status === "ALL" ? "All invoice statuses" : status.replaceAll("_", " ")}</option>)}</select></div><div className="divide-y divide-[#e3e9e6]">{filteredInvoices.map((invoice) => <article key={invoice.id} className="grid gap-3 px-5 py-5 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center md:px-6"><div><p className="text-sm font-semibold text-[#29423d]">Invoice {invoice.id.slice(0, 8).toUpperCase()}</p><p className="mt-1 text-xs text-[#82918c]">Reservation {invoice.reservation_id.slice(0, 8).toUpperCase()} · {date(invoice.created_at)}</p></div><p className="text-sm text-[#42615a]">Total {currency(Number(invoice.total_amount), invoice.currency)}<br /><span className="text-xs text-[#82918c]">Balance {currency(Number(invoice.balance_amount), invoice.currency)}</span></p><p className="text-xs text-[#648078]">{invoice.invoice_items?.length ?? 0} line items</p><span className={`w-fit px-2.5 py-1.5 text-[10px] font-semibold ${statusStyles[invoice.status] ?? "bg-[#e5e7e6] text-[#596561]"}`}>{invoice.status.replaceAll("_", " ")}</span></article>)}{filteredInvoices.length === 0 && <p className="p-12 text-center text-sm text-[#82918c]">No invoices match the selected status.</p>}</div></section>

            <section className="mt-8 border border-[#d9e1de] bg-[#f8faf9] shadow-sm"><div className="border-b border-[#d9e1de] p-5"><p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">TRANSACTION LEDGER</p><h2 className="mt-2 text-xl font-semibold text-[#173a34]">Recent payments</h2></div><div className="divide-y divide-[#e3e9e6]">{payments.slice(0, 10).map((payment) => <article key={payment.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center md:px-6"><div><p className="text-sm font-semibold text-[#29423d]">{currency(Number(payment.amount), payment.currency)}</p><p className="mt-1 text-xs text-[#82918c]">Reservation {payment.reservation_id.slice(0, 8).toUpperCase()}</p></div><p className="text-xs text-[#648078]">{payment.method ?? "Method not recorded"}</p><p className="text-xs text-[#648078]">{date(payment.created_at)}</p><span className={`w-fit px-2.5 py-1.5 text-[10px] font-semibold ${statusStyles[payment.status] ?? "bg-[#e5e7e6] text-[#596561]"}`}>{payment.status.replaceAll("_", " ")}</span></article>)}{payments.length === 0 && <p className="p-12 text-center text-sm text-[#82918c]">No payment records found.</p>}</div></section>
          </>}
        </div>
      </div>
    </main>
  );
}
