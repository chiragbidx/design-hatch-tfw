"use client";

import Link from "next/link";
import ClientNavbar from "../../components/ClientNavbar";
import BackButton from "../../components/BackButton";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";

type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED";

interface ClientProposal {
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
    budgetType: string;
    status: string;
  };
  freelancer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface JobWithProposals {
  id: number;
  title: string;
  description: string;
  budget: number;
  proposalCount: number;
  pendingCount: number;
  acceptedCount: number;
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

export default function ClientProposalsPage() {
  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [acceptWarning, setAcceptWarning] = useState<string | null>(null);

  const fetchProposals = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setProposals([]);
        setLoading(false);
        return;
      }

      const res = await axios.get("/api/client/proposals", {
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

  useEffect(() => {
    fetchProposals();
  }, []);

  const jobsList: JobWithProposals[] = useMemo(() => {
    const byJob = new Map<
      number,
      { job: ClientProposal["job"]; list: ClientProposal[] }
    >();
    for (const p of proposals) {
      const existing = byJob.get(p.jobId);
      if (!existing) {
        byJob.set(p.jobId, { job: p.job, list: [p] });
      } else {
        existing.list.push(p);
      }
    }
    return Array.from(byJob.entries()).map(([id, { job, list }]) => ({
      id,
      title: job.title,
      description: job.description,
      budget: job.budget,
      proposalCount: list.length,
      pendingCount: list.filter((x) => x.status === "PENDING").length,
      acceptedCount: list.filter((x) => x.status === "ACCEPTED").length,
    }));
  }, [proposals]);

  const selectedJob = selectedJobId
    ? jobsList.find((j) => j.id === selectedJobId)
    : null;
  const proposalsForJob = selectedJobId
    ? proposals.filter((p) => p.jobId === selectedJobId)
    : [];
  const hasAcceptedForJob =
    selectedJobId &&
    proposals.some((p) => p.jobId === selectedJobId && p.status === "ACCEPTED");

  const handleAccept = async (proposalId: number) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return;

    if (hasAcceptedForJob) {
      setAcceptWarning(
        "You have already accepted a proposal for this job. Only one freelancer can be hired per job."
      );
      return;
    }

    setAcceptWarning(null);
    setAcceptingId(proposalId);
    try {
      await axios.patch(
        `/api/proposals/${proposalId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setError(null);
      await fetchProposals();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to accept proposal");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setAcceptingId(null);
    }
  };

  const freelancerName = (p: ClientProposal) =>
    `${p.freelancer.firstName} ${p.freelancer.lastName}`.trim() ||
    p.freelancer.email ||
    "Freelancer";

  return (
    <div className="min-h-screen bg-white text-black">
      <ClientNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-10 flex flex-1 flex-col gap-6">
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600">
                Proposals received
              </p>
              <h1 className="text-xl font-semibold text-black sm:text-2xl">
                {selectedJobId
                  ? selectedJob?.title ?? "Proposals"
                  : "Jobs with proposals"}
              </h1>
              <p className="text-sm text-gray-600">
                {loading
                  ? "Loading…"
                  : selectedJobId
                    ? `${proposalsForJob.length} proposal${proposalsForJob.length === 1 ? "" : "s"} for this job`
                    : proposals.length === 0
                      ? "No proposals yet. They will appear here when freelancers apply to your jobs."
                      : `${jobsList.length} job${jobsList.length === 1 ? "" : "s"} with proposals`}
              </p>
            </div>

            {selectedJobId ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedJobId(null);
                  setAcceptWarning(null);
                }}
                className="inline-flex items-center justify-center rounded-full border border-emerald-500 bg-white px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
              >
                ← Back to jobs list
              </button>
            ) : (
              <Link
                href="/client/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
              >
                Back to dashboard
              </Link>
            )}
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
            {acceptWarning && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-800"
              >
                {acceptWarning}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                <p className="text-sm font-medium text-gray-600">
                  Loading proposals…
                </p>
              </div>
            ) : !selectedJobId ? (
              proposals.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                    📄
                  </div>
                  <p className="text-sm font-medium text-black">
                    No proposals yet
                  </p>
                  <p className="mt-1 max-w-sm text-[14px] text-gray-600">
                    When freelancers apply to your jobs, their proposals will
                    appear here. Click a job to view its proposals.
                  </p>
                  <Link
                    href="/client/jobpost"
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-emerald-400"
                  >
                    Post a job
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {jobsList.map((job) => (
                    <li key={job.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJobId(job.id);
                          setError(null);
                          setAcceptWarning(null);
                        }}
                        className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50 sm:px-5 sm:py-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-black">
                            {job.title}
                          </p>
                          <p className="mt-0.5 text-[14px] text-gray-600">
                            {job.proposalCount} proposal
                            {job.proposalCount === 1 ? "" : "s"}
                            {job.acceptedCount > 0
                              ? ` · ${job.acceptedCount} accepted`
                              : job.pendingCount > 0
                                ? ` · ${job.pendingCount} pending`
                                : ""}
                          </p>
                        </div>
                        <span className="shrink-0 text-[14px] font-medium text-emerald-600">
                          View proposals →
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <div className="space-y-4">
                {selectedJob && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-2">
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-emerald-700">
                      Job: {selectedJob.title}
                    </p>
                    <p className="text-[14px] text-gray-700">
                      ${selectedJob.budget} · {selectedJob.proposalCount}{" "}
                      proposal{selectedJob.proposalCount === 1 ? "" : "s"}
                      {selectedJob.acceptedCount > 0 &&
                        ` · You have accepted 1 freelancer for this job`}
                    </p>
                  </div>
                )}

                <ul className="space-y-3">
                  {proposalsForJob.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-2xl border border-gray-200/80 bg-white/70 px-3 py-3 sm:px-4 sm:py-3.5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-black">
                              {freelancerName(p)}
                            </span>
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
                            <span className="font-medium text-emerald-700">
                              ${p.bidAmount} fixed
                            </span>
                            <span>·</span>
                            <span>{p.timeline}</span>
                            <span>·</span>
                            <span>Submitted {formatDate(p.createdAt)}</span>
                          </div>
                        </div>
                        {p.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleAccept(p.id)}
                            disabled={acceptingId === p.id}
                            className="shrink-0 rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
                          >
                            {acceptingId === p.id ? "Accepting…" : "Accept"}
                          </button>
                        )}
                      </div>

                      <div className="mt-2 rounded-xl bg-gray-50 px-3 py-2">
                        <p className="text-[12px] font-medium uppercase tracking-wider text-gray-500">
                          Cover letter
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-[14px] text-gray-700">
                          {p.coverLetter}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <BackButton href="/client/dashboard">Back to dashboard</BackButton>
        </main>
      </div>
    </div>
  );
}
