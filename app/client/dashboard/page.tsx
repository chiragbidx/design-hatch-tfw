"use client";

import Link from "next/link";
import ClientNavbar from "../../components/ClientNavbar";
import { useEffect, useState } from "react";
import axios from "axios";

interface ClientStats {
  jobsCount: number;
  openJobsCount: number;
  jobsWithProposalsCount: number;
  proposalsCount: number;
  contractsCount: number;
  totalSpent: number;
  pendingSpent: number;
}

interface ClientJob {
  id: number;
  title: string;
  status: string;
  budget: number;
  budgetType: string;
  createdAt: string;
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [jobs, setJobs] = useState<ClientJob[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      setStatsLoading(false);
      return;
    }
    axios
      .get("/api/client/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (data && typeof data.jobsCount === "number")
          setStats({
            jobsCount: data.jobsCount,
            openJobsCount: data.openJobsCount ?? data.jobsCount,
            jobsWithProposalsCount: data.jobsWithProposalsCount ?? 0,
            proposalsCount: data.proposalsCount ?? 0,
            contractsCount: data.contractsCount ?? 0,
            totalSpent: data.totalSpent ?? 0,
            pendingSpent: data.pendingSpent ?? 0,
          });
      })
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) {
      setJobsLoading(false);
      return;
    }
    axios
      .get("/api/client/my-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setJobs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setJobs([]))
      .finally(() => setJobsLoading(false));
  }, [token]);

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white text-black">
      <ClientNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-10 flex flex-1 flex-col gap-8">
          {/* header row */}
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600">
                Client overview
              </p>
              <h1 className="text-xl font-semibold text-black sm:text-2xl">
                Welcome back,{" "}
                <span className="text-emerald-600">your PandaWork workspace</span>
              </h1>
              <p className="text-sm text-gray-600">
                Today is {today}. Manage jobs, review proposals and track spending
                from one central dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm sm:gap-3">
              <Link
                href="/client/jobpost"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
              >
                + Post new job
              </Link>
              <Link
                href="/client/proposals"
                className="inline-flex items-center justify-center rounded-full border border-emerald-500 bg-white px-4 py-2 font-medium text-emerald-600 transition hover:border-emerald-600 hover:bg-emerald-50"
              >
                View proposals
              </Link>
              <Link
                href="/client/jobs"
                className="inline-flex items-center justify-center rounded-full border border-emerald-500 bg-white px-4 py-2 font-medium text-emerald-600 transition hover:border-emerald-600 hover:bg-emerald-50"
              >
                My jobs · Invite freelancers
              </Link>
              <Link
                href="/client/contracts"
                className="inline-flex items-center justify-center rounded-full border border-emerald-500 bg-white px-4 py-2 font-medium text-emerald-600 transition hover:border-emerald-600 hover:bg-emerald-50"
              >
                Contracts & milestones
              </Link>
              <Link
                href="/freelancer/jobs"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:border-emerald-500 hover:bg-gray-50"
              >
                Browse freelancers
              </Link>
            </div>
          </section>

          {/* stats cards */}
          <section className="grid gap-4 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Active jobs posted",
                value: statsLoading
                  ? "—"
                  : stats != null
                    ? String(stats.openJobsCount)
                    : "—",
                sub:
                  stats != null && stats.jobsWithProposalsCount > 0
                    ? `${stats.jobsWithProposalsCount} receiving proposals`
                    : "Post jobs to get proposals",
                href: "/client/jobs",
              },
              {
                label: "Proposals received",
                value: statsLoading
                  ? "—"
                  : stats != null
                    ? String(stats.proposalsCount)
                    : "—",
                sub: "View and manage proposals",
                href: "/client/proposals",
              },
              {
                label: "Active contracts",
                value: statsLoading
                  ? "—"
                  : stats != null
                    ? String(stats.contractsCount)
                    : "—",
                sub: "Manage contracts & milestones",
                href: "/client/contracts",
              },
              {
                label: "Total spent",
                value:
                  statsLoading || stats == null
                    ? "—"
                    : `$${stats.totalSpent.toLocaleString()}`,
                sub:
                  stats != null && stats.pendingSpent > 0
                    ? `$${stats.pendingSpent.toLocaleString()} in escrow`
                    : "Released to freelancers",
                href: "/client/contracts",
              },
            ].map((card) => {
              const content = (
                <>
                  <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                    {card.label}
                  </p>
                  <p className="text-xl font-semibold text-emerald-600">
                    {card.value}
                  </p>
                  <p className="text-[14px] text-gray-600">{card.sub}</p>
                </>
              );
              const linkClass =
                "flex flex-col justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:border-emerald-300 hover:shadow-md";
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className={linkClass}
                >
                  {content}
                </Link>
              );
            })}
          </section>

          {/* main grid */}
          <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            {/* left: jobs pipeline */}
            <div className="space-y-5 rounded-3xl border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Jobs pipeline
                  </p>
                  <p className="mt-1 text-[14px] text-gray-600">
                    Track your jobs from draft to completion.
                  </p>
                </div>
                <Link
                  href="/client/jobpost"
                  className="rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-medium text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
                >
                  + Post new job
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Open",
                    status: "OPEN",
                    color: "bg-emerald-50",
                    jobList: jobs.filter((j) => j.status === "OPEN").slice(0, 5),
                  },
                  {
                    title: "Closed",
                    status: "CLOSED",
                    color: "bg-gray-50",
                    jobList: jobs.filter((j) => j.status === "CLOSED").slice(0, 5),
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
                        {jobsLoading ? "…" : jobs.filter((j) => j.status === col.status).length}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-[13px] text-gray-700">
                      {jobsLoading ? (
                        <li className="rounded-xl bg-white px-2 py-1 text-gray-500">Loading…</li>
                      ) : col.jobList.length === 0 ? (
                        <li className="rounded-xl bg-white px-2 py-1 text-gray-500">No jobs</li>
                      ) : (
                        col.jobList.map((job) => (
                          <li key={job.id}>
                            <Link
                              href={`/client/jobs/${job.id}/invite`}
                              className="line-clamp-1 block rounded-xl bg-white px-2 py-1 shadow-sm truncate hover:text-emerald-600"
                              title={job.title}
                            >
                              {job.title}
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
                  Tip: Keep job descriptions clear and detailed to attract the
                  right talent.
                </p>
                <Link
                  href="/client/jobs"
                  className="font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View all jobs
                </Link>
              </div>
            </div>

            {/* right: recent activity + budget snapshot */}
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
                  {stats != null && stats.proposalsCount > 0 ? (
                    <li className="flex items-start gap-3 rounded-2xl bg-gray-50 px-3 py-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <p className="text-[13px] text-gray-700">
                        You have {stats.proposalsCount} proposal
                        {stats.proposalsCount === 1 ? "" : "s"} on your jobs.{" "}
                        <Link href="/client/proposals" className="font-medium text-emerald-600 hover:underline">
                          Review proposals
                        </Link>
                      </p>
                    </li>
                  ) : (
                    <li className="rounded-2xl bg-gray-50 px-3 py-3 text-[13px] text-gray-600">
                      When you receive proposals or hire freelancers, activity will show here.
                    </li>
                  )}
                </ul>
              </div>

              <div className="space-y-3 rounded-3xl border border-gray-200 bg-white p-5 text-medium text-gray-700 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                      Budget snapshot
                    </p>
                    <p className="mt-1 text-[14px] text-gray-600">
                      Spending from your contracts.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-700">Total spent</span>
                    <span className="text-lg font-semibold text-emerald-600">
                      {statsLoading || stats == null
                        ? "—"
                        : `$${stats.totalSpent.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-700">In escrow</span>
                    <span className="text-gray-600">
                      {statsLoading || stats == null
                        ? "—"
                        : `$${stats.pendingSpent.toLocaleString()}`}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-600">
                    Released amounts go to freelancers. Escrow is held until you approve milestones.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}