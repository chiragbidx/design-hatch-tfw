"use client";

import Link from "next/link";
import ClientNavbar from "../../components/ClientNavbar";
import BackButton from "../../components/BackButton";
import { useEffect, useState } from "react";
import axios from "axios";

interface ContractWithDetails {
  id: number;
  status: string;
  createdAt: string;
  job: { id: number; title: string; status: string };
  freelancer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  milestones: { id: number; title: string; amount: number; status: string }[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ClientContractsPage() {
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get("/api/client/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setContracts(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setError("Failed to load contracts"))
      .finally(() => setLoading(false));
  }, []);

  const freelancerName = (c: ContractWithDetails) =>
    `${c.freelancer.firstName} ${c.freelancer.lastName}`.trim() ||
    c.freelancer.email;
  const totalMilestones = (c: ContractWithDetails) =>
    c.milestones.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="min-h-screen bg-white text-black">
      <ClientNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-10 flex flex-1 flex-col gap-6">
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600">
                Work engagements
              </p>
              <h1 className="text-xl font-semibold text-black sm:text-2xl">
                Contracts
              </h1>
              <p className="text-sm text-gray-600">
                {loading
                  ? "Loading…"
                  : `${contracts.length} contract${contracts.length === 1 ? "" : "s"}. Manage milestones and payments.`}
              </p>
            </div>

            <Link
              href="/client/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
            >
              Dashboard
            </Link>
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
            >
              {error}
            </div>
          )}

          <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center text-sm text-gray-600">
                Loading contracts…
              </div>
            ) : contracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                  📄
                </div>
                <p className="text-sm font-medium text-black">No contracts yet</p>
                <p className="mt-1 max-w-sm text-[14px] text-gray-600">
                  When you accept a proposal, a contract is created. You can then
                  add milestones, fund them, and release payment when work is
                  submitted.
                </p>
                <Link
                  href="/client/proposals"
                  className="mt-4 inline-flex rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-emerald-400"
                >
                  View proposals
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {contracts.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-4 sm:px-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/client/contracts/${c.id}`}
                          className="text-sm font-semibold text-black hover:text-emerald-600"
                        >
                          {c.job.title}
                        </Link>
                        <p className="mt-0.5 text-[14px] text-gray-600">
                          {freelancerName(c)} · {c.milestones.length} milestone
                          {c.milestones.length !== 1 ? "s" : ""} · Total $
                          {totalMilestones(c)}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Started {formatDate(c.createdAt)} · {c.status}
                        </p>
                      </div>
                      <Link
                        href={`/client/contracts/${c.id}`}
                        className="shrink-0 rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-emerald-400"
                      >
                        Manage
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <BackButton href="/client/dashboard">Back to dashboard</BackButton>
        </main>
      </div>
    </div>
  );
}
