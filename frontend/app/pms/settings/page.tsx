"use client";

import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const navigation = [
  ["Overview", "/pms"], ["Reservations", "/pms/reservations"], ["Rooms", "/pms/rooms"],
  ["Guests", "/pms/guests"], ["Housekeeping", "/pms/housekeeping"], ["Billing & Payments", "/pms/billing"], ["Reports", "/pms/reports"],
];

export default function PmsSettingsPage() {
  const [signedIn, setSignedIn] = useState(() => typeof window !== "undefined" && Boolean(window.localStorage.getItem("valereAccessToken")));

  function signOut() {
    window.localStorage.removeItem("valereAccessToken");
    setSignedIn(false);
  }

  return (
    <main className="min-h-screen bg-[#eef1f0] text-[#172522]"><aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#d9e1de] bg-[#173a34] px-5 py-7 text-white lg:block"><a href="/" className="block border-b border-white/15 pb-7"><p className="text-lg font-semibold tracking-[0.14em]">VALÉRE HAVEN</p><p className="mt-2 text-[10px] tracking-[0.25em] text-white/55">PROPERTY MANAGEMENT</p></a><nav className="mt-8 space-y-1 text-sm">{navigation.map(([label, href]) => <a key={label} href={href} className="block border-l-2 border-transparent px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white">{label}</a>)}<a href="/pms/settings" className="block border-l-2 border-[#e0b56d] bg-white/10 px-4 py-3 text-white">Settings</a></nav><div className="absolute bottom-7 left-5 right-5 border-t border-white/15 pt-5 text-xs text-white/45">Internal operations workspace</div></aside><div className="lg:pl-64"><header className="flex items-center justify-between border-b border-[#d9e1de] bg-[#f8faf9] px-6 py-5 md:px-10"><div><p className="text-[10px] font-semibold tracking-[0.25em] text-[#648078]">OPERATIONS / SETTINGS</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173a34]">Workspace settings</h1></div><a href="/pms" className="text-xs font-semibold text-[#9b6e2e] hover:underline">Back to overview</a></header><div className="mx-auto max-w-4xl px-6 py-8 md:px-10 md:py-10"><section className="border border-[#d9e1de] bg-[#f8faf9] p-6 shadow-sm"><p className="text-[10px] font-semibold tracking-[0.2em] text-[#648078]">CURRENT CONFIGURATION</p><h2 className="mt-2 text-xl font-semibold text-[#173a34]">Connected services</h2><dl className="mt-6 divide-y divide-[#e3e9e6] border-y border-[#e3e9e6]"><div className="grid gap-2 py-4 sm:grid-cols-[180px_1fr]"><dt className="text-xs font-semibold text-[#648078]">Operations API</dt><dd className="text-sm text-[#29423d]">{apiUrl}</dd></div><div className="grid gap-2 py-4 sm:grid-cols-[180px_1fr]"><dt className="text-xs font-semibold text-[#648078]">Staff session</dt><dd className="text-sm text-[#29423d]">{signedIn ? "Active access token present" : "No active access token"}</dd></div><div className="grid gap-2 py-4 sm:grid-cols-[180px_1fr]"><dt className="text-xs font-semibold text-[#648078]">Payment methods</dt><dd className="text-sm text-[#29423d]">Credit/debit card, GCash, Maya, cash, and bank transfer</dd></div><div className="grid gap-2 py-4 sm:grid-cols-[180px_1fr]"><dt className="text-xs font-semibold text-[#648078]">Room inventory</dt><dd className="text-sm text-[#29423d]">56 rooms across Standard, Superior, Deluxe, Executive, and Suite types</dd></div></dl><p className="mt-6 text-sm leading-6 text-[#648078]">Sensitive Supabase service credentials remain server-side. Payment providers are not configured in this workspace, so external payment success cannot be recorded here.</p>{signedIn ? <button type="button" onClick={signOut} className="mt-6 bg-[#173a34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#102b27]">Sign out of PMS</button> : <a href="/pms/login" className="mt-6 inline-block bg-[#173a34] px-5 py-3 text-sm font-semibold text-white">Sign in to PMS</a>}</section></div></div></main>
  );
}
