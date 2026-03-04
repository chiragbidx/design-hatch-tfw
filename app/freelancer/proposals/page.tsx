"use client";

import Link from "next/link";
import BackButton from "../../components/BackButton";
import { useEffect, useState } from "react";
import FreelancerNavbar from "@/app/components/FreelancerNavbar";
import axios from "axios";

type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED";

interface ProposalWithJob {
  id: number;
  coverLetter: string;
  bidAmount: number;
  timeline: string;
  status: ProposalStatus;
  createdAt: string;
  jobId: number;
  job: {
    id: number;
    title: string;
    description: string;
    budget: number;
    jobType: string;
    status: string;
    client: {
      id: number;
      firstName: string;
      lastName: string;
    };
  };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function statusStyle(status: ProposalStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
    case "ACCEPTED":
      return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
    case "REJECTED":
      return "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function FreelancerProposalsPage() {
  const [proposals, setProposals] = useState<ProposalWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setProposals([]);
          setLoading(false);
          return;
        }

        const res = await axios.get("/api/freelancer/proposals", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProposals(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setProposals([]);
            setLoading(false);
            return;
          }
          setError(err.response?.data?.error || "Failed to load proposals");
        } else {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
        setProposals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const clientName = (p: ProposalWithJob) =>
    `${p.job.client.firstName} ${p.job.client.lastName}`.trim() || "Client";

  return (
    <div className="min-h-screen bg-white text-black">
      <FreelancerNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-6 flex flex-1 flex-col gap-6">
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600">
                Active proposals
              </p>
              <h1 className="text-xl font-semibold text-black sm:text-2xl">
                Proposals you&apos;ve submitted
              </h1>
              <p className="text-sm text-gray-600">
                {loading
                  ? "Loading…"
                  : proposals.length === 0
                    ? "Submit a proposal from a job page to see it here."
                    : `${proposals.length} proposal${proposals.length === 1 ? "" : "s"}`}
              </p>
            </div>

            <Link
              href="/freelancer/jobs"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
            >
              Find work
            </Link>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-4 text-[14px] text-gray-700 shadow-sm sm:p-5">
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
              >
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                <p className="text-sm font-medium text-gray-600">
                  Loading proposals…
                </p>
              </div>
            ) : proposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                  📄
                </div>
                <p className="text-sm font-medium text-black">No proposals yet</p>
                <p className="mt-1 max-w-sm text-[14px] text-gray-600">
                  When you apply to a job, your proposal will appear here. You
                  can track status: Pending, Accepted, or Rejected.
                </p>
                <Link
                  href="/freelancer/jobs"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-emerald-400"
                >
                  Browse jobs
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {proposals.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-2xl border border-gray-200/80 bg-white/70 px-3 py-3 sm:px-4 sm:py-3.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/freelancer/jobs/${p.job.id}`}
                            className="text-sm font-semibold text-black hover:text-emerald-600"
                          >
                            {p.job.title}
                          </Link>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${statusStyle(p.status)}`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <p className="line-clamp-2 whitespace-pre-wrap text-[14px] text-gray-600">
                          {p.job.description}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[14px] text-gray-600">
                          <span>{clientName(p)}</span>
                          <span>•</span>
                          <span className="font-medium text-emerald-700">
                            ${p.bidAmount} fixed
                          </span>
                          <span>•</span>
                          <span>{p.timeline}</span>
                          <span>•</span>
                          <span>Submitted {formatDate(p.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="line-clamp-2 whitespace-pre-wrap text-[12px] text-gray-500">
                        {p.coverLetter}
                      </p>
                      <Link
                        href={`/freelancer/jobs/${p.job.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-emerald-500 px-3 py-1.5 text-[14px] font-medium text-emerald-700 transition hover:bg-emerald-50"
                      >
                        View job
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <BackButton href="/freelancer/dashboard">Back to dashboard</BackButton>
        </main>
      </div>
    </div>
  );
}
