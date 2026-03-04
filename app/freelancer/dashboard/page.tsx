"use client";

import Link from "next/link";
import FreelancerNavbar from "../../components/FreelancerNavbar";
import { useEffect, useState } from "react";
import axios from "axios";

interface FreelancerStats {
  proposalsCount: number;
  pendingProposalsCount: number;
  contractsCount: number;
  earningsReleased: number;
  earningsPending: number;
  availableBalance: number;
  totalWithdrawn: number;
}

interface ProposalWithJob {
  id: number;
  status: string;
  job: { id: number; title: string };
}

export default function FreelancerDashboard() {
  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const [stats, setStats] = useState<FreelancerStats | null>(null);
  const [proposals, setProposals] = useState<ProposalWithJob[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [proposalsLoading, setProposalsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileCompletion = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;

        await axios.get("/api/freelancer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    };

    fetchProfileCompletion();
  }, []);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      setTimeout(() => setStatsLoading(false), 0);
      return;
    }
    axios
      .get("/api/freelancer/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        if (data && typeof data.proposalsCount === "number")
          setStats({
            proposalsCount: data.proposalsCount,
            pendingProposalsCount: data.pendingProposalsCount ?? 0,
            contractsCount: data.contractsCount ?? 0,
            earningsReleased: data.earningsReleased ?? 0,
            earningsPending: data.earningsPending ?? 0,
            availableBalance: data.availableBalance ?? 0,
            totalWithdrawn: data.totalWithdrawn ?? 0,
          });
      })
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) {
      setTimeout(() => setProposalsLoading(false), 0);
      return;
    }
    axios
      .get("/api/freelancer/proposals", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProposals(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProposals([]))
      .finally(() => setProposalsLoading(false));
  }, [token]);

  const statsCards = [
    {
      label: "Active proposals",
      value: statsLoading
        ? "—"
        : stats != null
          ? String(stats.proposalsCount)
          : "—",
      sub:
        stats != null && stats.pendingProposalsCount > 0
          ? `${stats.pendingProposalsCount} awaiting client reply`
          : "View your proposals",
      href: "/freelancer/proposals",
    },
    {
      label: "Active contracts",
      value: statsLoading
        ? "—"
        : stats != null
          ? String(stats.contractsCount)
          : "—",
      sub: "View contracts & milestones",
      href: "/freelancer/contracts",
    },
    {
      label: "Earnings released",
      value:
        statsLoading || stats == null
          ? "—"
          : `$${stats.earningsReleased.toLocaleString()}`,
      sub:
        stats != null && stats.earningsPending > 0
          ? `$${stats.earningsPending.toLocaleString()} pending approval`
          : "From released milestones",
      href: "/freelancer/contracts",
    },
    {
      label: "Withdrawals",
      value:
        statsLoading || stats == null
          ? "—"
          : `$${stats.availableBalance.toLocaleString()} available`,
      sub:
        stats != null && stats.totalWithdrawn > 0
          ? `$${stats.totalWithdrawn.toLocaleString()} withdrawn`
          : "Request payout from released earnings",
      href: "/freelancer/withdrawals",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <FreelancerNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        {/* glow background */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        {/* main */}
        <main className="relative z-10 mt-6 flex flex-1 flex-col gap-8">
          {/* header row */}
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600">
                Freelancer overview
              </p>
              <h1 className="text-xl font-semibold text-black sm:text-2xl">
                Welcome back,{" "}
                <span className="text-emerald-600">your PandaWork profile</span>
              </h1>
              <p className="text-sm text-gray-600">
                Today is {today}. Track proposals, contracts and earnings from
                one minimal dashboard.
              </p>
            </div>

            {/* <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href="/freelancer/jobs"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
              >
                Browse jobs
              </Link>
              <Link
                href="/freelancer/contracts"
                className="inline-flex items-center justify-center rounded-full border border-emerald-500 bg-white px-4 py-2 font-medium text-emerald-600 transition hover:border-emerald-600 hover:bg-emerald-50"
              >
                Contracts & milestones
              </Link>
              <Link
                href="/freelancer/profile"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:border-emerald-500 hover:bg-gray-50"
              >
                View profile
              </Link>
            </div> */}
          </section>

          {/* stats cards */}
          <section className="grid gap-4 text-medium text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="flex flex-col justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  {card.label}
                </p>
                <p className="text-xl font-semibold text-emerald-600">
                  {card.value}
                </p>
                <p className="text-[14px] text-gray-600">{card.sub}</p>
              </Link>
            ))}
          </section>

          {/* main grid */}
          <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            {/* left: pipeline */}
            <div className="space-y-5 rounded-3xl border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Pipeline
                  </p>
                  <p className="mt-1 text-[14px] text-gray-600">
                    Track proposals from sent to hired.
                  </p>
                </div>
                <Link
                  href="/freelancer/jobs"
                  className="rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-medium text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
                >
                  + New proposal
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {[
                  {
                    title: "Pending",
                    status: "PENDING",
                    color: "bg-gray-50",
                    list: proposals
                      .filter((p) => p.status === "PENDING")
                      .slice(0, 5),
                  },
                  {
                    title: "Accepted",
                    status: "ACCEPTED",
                    color: "bg-emerald-50",
                    list: proposals
                      .filter((p) => p.status === "ACCEPTED")
                      .slice(0, 5),
                  },
                  {
                    title: "Rejected",
                    status: "REJECTED",
                    color: "bg-gray-50",
                    list: proposals
                      .filter((p) => p.status === "REJECTED")
                      .slice(0, 5),
                  },
                ].map((col) => (
                  <div
                    key={col.title}
                    className={`space-y-2 rounded-2xl border border-gray-200 p-3 ${col.color} min-w-0`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-gray-700 truncate">
                        {col.title}
                      </p>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[13px] text-emerald-600 shadow-sm shrink-0">
                        {proposalsLoading
                          ? "…"
                          : proposals.filter((p) => p.status === col.status)
                              .length}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-[13px] text-gray-700">
                      {proposalsLoading ? (
                        <li className="rounded-xl bg-white px-2 py-1 text-gray-500">
                          Loading…
                        </li>
                      ) : col.list.length === 0 ? (
                        <li className="rounded-xl bg-white px-2 py-1 text-gray-500">
                          None
                        </li>
                      ) : (
                        col.list.map((p) => (
                          <li key={p.id}>
                            <Link
                              href={`/freelancer/jobs/${p.job.id}`}
                              className="line-clamp-1 block rounded-xl bg-white px-2 py-1 shadow-sm truncate hover:text-emerald-600"
                              title={p.job.title}
                            >
                              {p.job.title}
                            </Link>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[13px] text-gray-600">
                <p>
                  Tip: Keep proposals short, focused and tailored to each job.
                </p>
                <Link
                  href="/freelancer/proposals"
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  View all proposals
                </Link>
              </div>
            </div>

            {/* right: recent activity + availability */}
            <div className="space-y-5">
              <div className="space-y-3 rounded-3xl border border-gray-200 bg-white p-5 text-medium text-gray-700 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                      Recent activity
                    </p>
                    <p className="mt-1 text-[14px] text-gray-600">
                      What happened on your account recently.
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5">
                  {stats != null && stats.contractsCount > 0 ? (
                    <li className="flex items-start gap-3 rounded-2xl bg-gray-50 px-3 py-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <p className="text-[13px] text-gray-700">
                        You have {stats.contractsCount} active contract
                        {stats.contractsCount === 1 ? "" : "s"}.{" "}
                        <Link
                          href="/freelancer/contracts"
                          className="font-medium text-emerald-600 hover:underline"
                        >
                          View contracts
                        </Link>
                      </p>
                    </li>
                  ) : (
                    <li className="rounded-2xl bg-gray-50 px-3 py-3 text-[13px] text-gray-600">
                      When clients accept your proposals, activity will show
                      here.
                    </li>
                  )}
                </ul>
              </div>

              <div className="space-y-3 rounded-3xl border border-gray-200 bg-white p-5 text-medium text-gray-700 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                      Profile
                    </p>
                    <p className="mt-1 text-[14px] text-gray-600">
                      Complete your profile to get more visibility.
                    </p>
                  </div>
                  <Link
                    href="/freelancer/profile"
                    className="rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-medium text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
                  >
                    Edit profile
                  </Link>
                </div>
                <p className="text-[13px] text-gray-600">
                  Add about, skills, experience, rate and portfolio to stand out
                  to clients.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
