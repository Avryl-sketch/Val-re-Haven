"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

type Invoice = {
  id: string;
  reservation_id: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  balance_amount: number;
  outstanding_balance: number;
  status: string;
  amount_paid: number;
  finalized_at: string | null;
  billing_model_version: number;
  created_at: string;
  reservations?: {
    id: string;
    check_in: string;
    check_out: string;
    total_amount: number;
    guests?: { first_name: string; last_name: string } | null;
    room_types?: { name: string } | null;
  } | null;
  invoice_items?: Array<{ id: string; description: string; amount: number }>;
};

type Payment = {
  id: string;
  reservation_id: string;
  invoice_id: string | null;
  amount: number;
  currency: string;
  method: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
};

type Reservation = {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number;
  room_types?: { name: string } | null;
  guests?: { first_name: string; last_name: string } | null;
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
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: code, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value ?? 0);
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function PmsBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [newReservationId, setNewReservationId] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [chargeDescription, setChargeDescription] = useState("");
  const [chargeQuantity, setChargeQuantity] = useState("1");
  const [chargeUnitPrice, setChargeUnitPrice] = useState("");
  const [chargeKey, setChargeKey] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentKey, setPaymentKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  async function reload(token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    const [invoiceResponse, paymentResponse, reservationResponse] = await Promise.all([
      fetch(`${apiUrl}/billing/invoices`, { headers }),
      fetch(`${apiUrl}/payments`, { headers }),
      fetch(`${apiUrl}/reservations`, { headers }),
    ]);
    if (!invoiceResponse.ok || !paymentResponse.ok || !reservationResponse.ok) {
      throw new Error("Billing records could not be refreshed.");
    }
    const [invoiceData, paymentData, reservationData] = await Promise.all([
      invoiceResponse.json() as Promise<Invoice[]>,
      paymentResponse.json() as Promise<Payment[]>,
      reservationResponse.json() as Promise<Reservation[]>,
    ]);
    setInvoices(invoiceData);
    setPayments(paymentData);
    setReservations(reservationData);
  }

  useEffect(() => {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token) {
      queueMicrotask(() => setState("signed-out"));
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
      fetch(`${apiUrl}/reservations`, { headers }).then(async (response) => {
        if (!response.ok) throw new Error("Reservations could not be loaded.");
        return response.json() as Promise<Reservation[]>;
      }),
    ]).then(([invoiceData, paymentData, reservationData]) => {
      setInvoices(invoiceData);
      setPayments(paymentData);
      setReservations(reservationData);
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
  const folioOutstanding = (invoice: Invoice) => invoice.billing_model_version >= 2 ? Number(invoice.outstanding_balance) : Number(invoice.balance_amount);
  const outstanding = invoices.filter((invoice) => invoice.billing_model_version >= 2 && invoice.currency === "PHP").reduce((total, invoice) => total + folioOutstanding(invoice), 0);
  const legacyInvoiceCount = invoices.filter((invoice) => invoice.billing_model_version < 2).length;
  const collected = payments.filter((payment) => payment.status === "SUCCEEDED" && payment.currency === "PHP").reduce((total, payment) => total + Number(payment.amount ?? 0), 0);
  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null;
  const unbilledReservations = reservations.filter((reservation) => !invoices.some((invoice) => invoice.reservation_id === reservation.id));

  async function request(url: string, body: unknown, onSuccess: (result?: { id?: string }) => void) {
    const token = window.localStorage.getItem("valereAccessToken");
    if (!token) {
      setState("signed-out");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      const response = await fetch(`${apiUrl}${url}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(payload?.message ?? "Billing action could not be completed.");
      }
      const result = await response.json().catch(() => undefined) as { id?: string } | undefined;
      await reload(token);
      onSuccess(result);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Billing action could not be completed.");
    } finally {
      setSaving(false);
    }
  }

  function createFolio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newReservationId) return;
    void request("/billing/invoices", {
      reservationId: newReservationId,
      currency: "PHP",
    }, (result) => {
      if (result?.id) setSelectedInvoiceId(result.id);
      setNewReservationId("");
    });
  }

  function addCharge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedInvoice || !chargeDescription.trim()) return;
    const requestKey = chargeKey || crypto.randomUUID();
    setChargeKey(requestKey);
    void request("/billing/invoice-items", {
      invoiceId: selectedInvoice.id,
      description: chargeDescription.trim(),
      quantity: Number(chargeQuantity),
      unitPrice: Number(chargeUnitPrice),
      idempotencyKey: requestKey,
    }, () => {
      setChargeDescription("");
      setChargeQuantity("1");
      setChargeUnitPrice("");
      setChargeKey("");
    });
  }

  function recordPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedInvoice || !selectedInvoice.reservations || Number(paymentAmount) <= 0) return;
    const requestKey = paymentKey || crypto.randomUUID();
    setPaymentKey(requestKey);
    void request("/payments", {
      reservationId: selectedInvoice.reservation_id,
      invoiceId: selectedInvoice.id,
      amount: Number(paymentAmount),
      currency: selectedInvoice.currency,
      method: paymentMethod,
      status: "SUCCEEDED",
      idempotencyKey: requestKey,
    }, () => {
      setPaymentAmount("");
      setPaymentKey("");
    });
  }

  function finalizeInvoice() {
    if (!selectedInvoice) return;
    void request(`/billing/invoices/${selectedInvoice.id}/finalize`, {}, () => undefined);
  }

  function updateDiscount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedInvoice) return;
    void request(`/billing/invoices/${selectedInvoice.id}/discount`, {
      discountAmount: Number(discountAmount),
    }, () => setDiscountAmount(""));
  }

  function applyPayment(paymentId: string) {
    if (!selectedInvoice) return;
    void request(`/billing/invoices/${selectedInvoice.id}/apply-payment/${paymentId}`, {}, () => undefined);
  }

  const unappliedPayments = selectedInvoice
    ? payments.filter((payment) => payment.reservation_id === selectedInvoice.reservation_id && !payment.invoice_id && payment.status === "SUCCEEDED" && payment.currency === selectedInvoice.currency)
    : [];

  return (
    <main className="min-h-screen bg-[#eef1f0] text-[#172522]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#d9e1de] bg-[#173a34] px-5 py-7 text-white lg:block">
        <Link href="/" className="block border-b border-white/15 pb-7"><p className="text-lg font-semibold tracking-[0.14em]">VALÉRE HAVEN</p><p className="mt-2 text-[10px] tracking-[0.25em] text-white/55">PROPERTY MANAGEMENT</p></Link>
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
            <section className="grid gap-4 sm:grid-cols-3"><article className="border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm"><p className="text-xs text-[#648078]">Reconciled outstanding balance</p><p className="mt-4 text-3xl font-semibold text-[#173a34]">{currency(outstanding)}</p>{legacyInvoiceCount > 0 && <p className="mt-2 text-xs text-[#8a6b2c]">{legacyInvoiceCount} legacy folio(s) require manual reconciliation</p>}</article><article className="border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm"><p className="text-xs text-[#648078]">Successful payment records</p><p className="mt-4 text-3xl font-semibold text-[#173a34]">{currency(collected)}</p></article><article className="border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm"><p className="text-xs text-[#648078]">Open invoices</p><p className="mt-4 text-3xl font-semibold text-[#173a34]">{invoices.filter((invoice) => invoice.status === "OPEN").length}</p></article></section>

            {actionError && <p role="alert" className="mt-6 border border-[#e4b7ae] bg-[#fff7f5] px-4 py-3 text-sm text-[#a24d3c]">{actionError}</p>}

            <section className="mt-6 border border-[#d9e1de] bg-[#f8faf9] p-5 shadow-sm">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">NEW FOLIO</p>
              <form onSubmit={createFolio} className="mt-4 grid gap-4 sm:grid-cols-[2fr_auto] sm:items-end">
                <label className="text-xs text-[#648078]">Reservation<select required value={newReservationId} onChange={(event) => setNewReservationId(event.target.value)} className="mt-2 w-full border border-[#cbd8d3] bg-white px-3 py-2.5 text-sm text-[#29423d]"><option value="">Select reservation</option>{unbilledReservations.map((reservation) => <option key={reservation.id} value={reservation.id}>{reservation.guests ? `${reservation.guests.first_name} ${reservation.guests.last_name}` : "Guest profile unavailable"} · {reservation.room_types?.name ?? "Room type"} · {reservation.check_in}</option>)}</select></label>
                <button type="submit" disabled={saving || !newReservationId} className="bg-[#173a34] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Create folio</button>
              </form>
              <p className="mt-3 text-xs text-[#82918c]">Room and additional charges are posted explicitly below. The configured 12% VAT is calculated by the backend from discounted taxable charges.</p>
            </section>

            {selectedInvoice && <section className="mt-6 border border-[#b9cbc5] bg-[#f8faf9] shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#d9e1de] p-5">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">FOLIO {selectedInvoice.id.slice(0, 8).toUpperCase()}</p>
                  <h2 className="mt-2 text-xl font-semibold text-[#173a34]">{selectedInvoice.reservations?.guests ? `${selectedInvoice.reservations.guests.first_name} ${selectedInvoice.reservations.guests.last_name}` : "Guest profile unavailable"}</h2>
                  <p className="mt-1 text-sm text-[#648078]">Reservation {selectedInvoice.reservation_id.slice(0, 8).toUpperCase()} · {selectedInvoice.reservations?.room_types?.name ?? "Room type unavailable"}</p>
                  {selectedInvoice.reservations && <p className="mt-1 text-xs text-[#82918c]">{date(selectedInvoice.reservations.check_in)} to {date(selectedInvoice.reservations.check_out)}</p>}
                </div>
                <button type="button" onClick={() => setSelectedInvoiceId("")} className="text-xs font-semibold text-[#648078] hover:underline">Close folio</button>
              </div>

              {selectedInvoice.billing_model_version < 2 && <p className="border-b border-[#e2c58f] bg-[#fffaf0] px-5 py-3 text-sm text-[#85652d]">Legacy folio: historical deposits and payments have not been automatically remapped. Existing amounts are preserved; this folio is read-only for reconciliation.</p>}

              <div className="grid gap-6 p-5 xl:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <h3 className="text-sm font-semibold text-[#29423d]">Itemized charges</h3>
                  <div className="mt-3 divide-y divide-[#e3e9e6] border-y border-[#e3e9e6]">
                    {(selectedInvoice.invoice_items ?? []).map((item) => <div key={item.id} className="grid grid-cols-[1fr_auto] gap-4 py-3 text-sm"><span className="text-[#42615a]">{item.description}</span><span className="font-medium text-[#29423d]">{currency(Number(item.amount), selectedInvoice.currency)}</span></div>)}
                    {(selectedInvoice.invoice_items ?? []).length === 0 && <p className="py-6 text-sm text-[#82918c]">No charge items have been posted.</p>}
                  </div>

                  {selectedInvoice.billing_model_version >= 2 && !selectedInvoice.finalized_at && <form onSubmit={addCharge} className="mt-5 border border-[#d9e1de] bg-white p-4">
                    <p className="text-xs font-semibold text-[#29423d]">Post charge</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1.5fr_0.5fr_0.7fr_auto] sm:items-end">
                      <label className="text-xs text-[#648078]">Description<input required value={chargeDescription} onChange={(event) => setChargeDescription(event.target.value)} placeholder="Room accommodation or additional charge" className="mt-2 w-full border border-[#cbd8d3] px-3 py-2 text-sm" /></label>
                      <label className="text-xs text-[#648078]">Qty<input required type="number" min="0.01" step="0.01" value={chargeQuantity} onChange={(event) => setChargeQuantity(event.target.value)} className="mt-2 w-full border border-[#cbd8d3] px-3 py-2 text-sm" /></label>
                      <label className="text-xs text-[#648078]">Unit price<input required type="number" min="0" step="0.01" value={chargeUnitPrice} onChange={(event) => setChargeUnitPrice(event.target.value)} className="mt-2 w-full border border-[#cbd8d3] px-3 py-2 text-sm" /></label>
                      <button type="submit" disabled={saving} className="bg-[#173a34] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Add charge</button>
                    </div>
                  </form>}

                  <h3 className="mt-6 text-sm font-semibold text-[#29423d]">Payments applied to folio</h3>
                  <div className="mt-3 divide-y divide-[#e3e9e6] border-y border-[#e3e9e6]">{payments.filter((payment) => payment.invoice_id === selectedInvoice.id && payment.status === "SUCCEEDED").map((payment) => <div key={payment.id} className="flex justify-between gap-4 py-3 text-sm"><span className="text-[#648078]">{payment.method?.replaceAll("_", " ") ?? "Method not recorded"} · {date(payment.paid_at ?? payment.created_at)}</span><span className="font-medium text-[#29423d]">{currency(Number(payment.amount), payment.currency)}</span></div>)}{payments.filter((payment) => payment.invoice_id === selectedInvoice.id && payment.status === "SUCCEEDED").length === 0 && <p className="py-4 text-xs text-[#82918c]">No successful payments are linked to this folio.</p>}</div>
                  {selectedInvoice.billing_model_version >= 2 && unappliedPayments.length > 0 && <div className="mt-4 border border-[#d9e1de] bg-white p-4"><p className="text-xs font-semibold text-[#29423d]">Unapplied existing reservation payments</p>{unappliedPayments.map((payment) => <div key={payment.id} className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs"><span>{payment.method?.replaceAll("_", " ") ?? "Payment"} · {currency(Number(payment.amount), payment.currency)} · {date(payment.paid_at ?? payment.created_at)}</span><button type="button" disabled={saving} onClick={() => applyPayment(payment.id)} className="font-semibold text-[#9b6e2e] hover:underline disabled:opacity-50">Apply to folio</button></div>)}</div>}
                </div>

                <div>
                  <div className="border border-[#d9e1de] bg-white p-5">
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">SERVER-CALCULATED TOTALS</p>
                    <dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-[#648078]">Subtotal</dt><dd>{currency(Number(selectedInvoice.subtotal), selectedInvoice.currency)}</dd></div><div className="flex justify-between gap-4"><dt className="text-[#648078]">VAT (12%)</dt><dd>{currency(Number(selectedInvoice.tax_amount), selectedInvoice.currency)}</dd></div><div className="flex justify-between gap-4"><dt className="text-[#648078]">Discount</dt><dd>-{currency(Number(selectedInvoice.discount_amount), selectedInvoice.currency)}</dd></div><div className="flex justify-between gap-4 border-t border-[#e3e9e6] pt-3 font-semibold"><dt>Total</dt><dd>{currency(Number(selectedInvoice.total_amount), selectedInvoice.currency)}</dd></div><div className="flex justify-between gap-4"><dt className="text-[#648078]">Successful payments</dt><dd>{currency(Number(selectedInvoice.amount_paid), selectedInvoice.currency)}</dd></div><div className="flex justify-between gap-4 font-semibold text-[#173a34]"><dt>Outstanding balance</dt><dd>{currency(folioOutstanding(selectedInvoice), selectedInvoice.currency)}</dd></div><div className="flex justify-between gap-4 border-t border-[#e3e9e6] pt-3"><dt className="text-[#648078]">Folio status</dt><dd>{selectedInvoice.status.replaceAll("_", " ")}</dd></div></dl>
                    {selectedInvoice.billing_model_version >= 2 && !selectedInvoice.finalized_at && <form onSubmit={updateDiscount} className="mt-5 flex gap-2"><label className="sr-only" htmlFor="folio-discount">Folio discount</label><input id="folio-discount" required type="number" min="0" step="0.01" value={discountAmount} onChange={(event) => setDiscountAmount(event.target.value)} placeholder="Discount amount" className="min-w-0 flex-1 border border-[#cbd8d3] px-3 py-2 text-sm" /><button disabled={saving} className="border border-[#173a34] px-3 py-2 text-xs font-semibold text-[#173a34] disabled:opacity-50">Apply discount</button></form>}
                    {selectedInvoice.billing_model_version >= 2 && !selectedInvoice.finalized_at && <button type="button" onClick={finalizeInvoice} disabled={saving} className="mt-5 w-full bg-[#9b6e2e] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Finalize folio</button>}
                  </div>

                  {selectedInvoice.billing_model_version >= 2 && <form onSubmit={recordPayment} className="mt-4 border border-[#d9e1de] bg-white p-5"><p className="text-xs font-semibold text-[#29423d]">Record staff-confirmed payment</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs text-[#648078]">Amount<input required type="number" min="0.01" step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} className="mt-2 w-full border border-[#cbd8d3] px-3 py-2 text-sm" /></label><label className="text-xs text-[#648078]">Method<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-2 w-full border border-[#cbd8d3] bg-white px-3 py-2 text-sm"><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank transfer</option></select></label></div><button type="submit" disabled={saving} className="mt-4 w-full bg-[#173a34] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Record as received</button><p className="mt-2 text-xs text-[#82918c]">Use only after staff has verified receipt. No external provider is assumed.</p></form>}
                </div>
              </div>
            </section>}

            <section className="mt-8 border border-[#d9e1de] bg-[#f8faf9] shadow-sm"><div className="flex flex-col gap-5 border-b border-[#d9e1de] p-5 md:flex-row md:items-center md:justify-between"><div><p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">{filteredInvoices.length} RECORDS</p><h2 className="mt-2 text-xl font-semibold text-[#173a34]">Invoices</h2></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="border border-[#cbd8d3] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#173a34]">{invoiceStatuses.map((status) => <option key={status} value={status}>{status === "ALL" ? "All invoice statuses" : status.replaceAll("_", " ")}</option>)}</select></div><div className="divide-y divide-[#e3e9e6]">{filteredInvoices.map((invoice) => <article key={invoice.id} className="grid gap-3 px-5 py-5 md:grid-cols-[1.5fr_1fr_1fr_auto_auto] md:items-center md:px-6"><div><p className="text-sm font-semibold text-[#29423d]">Invoice {invoice.id.slice(0, 8).toUpperCase()}</p><p className="mt-1 text-xs text-[#82918c]">Reservation {invoice.reservation_id.slice(0, 8).toUpperCase()} · {date(invoice.created_at)}</p></div><p className="text-sm text-[#42615a]">Total {currency(Number(invoice.total_amount), invoice.currency)}<br /><span className="text-xs text-[#82918c]">Balance {currency(Number(invoice.balance_amount), invoice.currency)}</span></p><p className="text-xs text-[#648078]">{invoice.invoice_items?.length ?? 0} line items</p><span className={`w-fit px-2.5 py-1.5 text-[10px] font-semibold ${statusStyles[invoice.status] ?? "bg-[#e5e7e6] text-[#596561]"}`}>{invoice.status.replaceAll("_", " ")}{invoice.billing_model_version < 2 ? " · LEGACY" : ""}</span><button type="button" onClick={() => setSelectedInvoiceId(invoice.id)} className="w-fit text-xs font-semibold text-[#9b6e2e] hover:underline">Open folio</button></article>)}{filteredInvoices.length === 0 && <p className="p-12 text-center text-sm text-[#82918c]">No invoices match the selected status.</p>}</div></section>

            <section className="mt-8 border border-[#d9e1de] bg-[#f8faf9] shadow-sm"><div className="border-b border-[#d9e1de] p-5"><p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">TRANSACTION LEDGER</p><h2 className="mt-2 text-xl font-semibold text-[#173a34]">Recent payments</h2></div><div className="divide-y divide-[#e3e9e6]">{payments.slice(0, 10).map((payment) => <article key={payment.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center md:px-6"><div><p className="text-sm font-semibold text-[#29423d]">{currency(Number(payment.amount), payment.currency)}</p><p className="mt-1 text-xs text-[#82918c]">Reservation {payment.reservation_id.slice(0, 8).toUpperCase()}</p></div><p className="text-xs text-[#648078]">{payment.method ?? "Method not recorded"}</p><p className="text-xs text-[#648078]">{date(payment.created_at)}</p><span className={`w-fit px-2.5 py-1.5 text-[10px] font-semibold ${statusStyles[payment.status] ?? "bg-[#e5e7e6] text-[#596561]"}`}>{payment.status.replaceAll("_", " ")}</span></article>)}{payments.length === 0 && <p className="p-12 text-center text-sm text-[#82918c]">No payment records found.</p>}</div></section>
          </>}
        </div>
      </div>
    </main>
  );
}
