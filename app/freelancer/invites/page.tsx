"use client";

import Link from "next/link";
import BackButton from "../../components/BackButton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FreelancerNavbar from "@/app/components/FreelancerNavbar";
import axios from "axios";

type InviteStatus = "PENDING" | "ACCEPTED" | "DECLINED";

interface InviteWithDetails {
  id: number;
  message: string | null;
  status: InviteStatus;
  createdAt: string;
  jobId: number;
  job: {
    id: number;
    title: string;
    description: string;
    budget: number;
    budgetType: string;
    status: string;
    experienceLevel: string;
  };
  invitedBy: {
    id: number;
    firstName: string;
    lastName: string;
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

function statusStyle(status: InviteStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
    case "ACCEPTED":
      return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
    case "DECLINED":
      return "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function FreelancerInvitesPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<InviteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const fetchInvites = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setInvites([]);
        setLoading(false);
        return;
      }

      const res = await axios.get("/api/freelancer/invites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInvites(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setInvites([]);
          setLoading(false);
          return;
        }
        setError(err.response?.data?.error || "Failed to load invites");
      } else {
        setError("Something went wrong");
      }
      setInvites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleRespond = async (
    inviteId: number,
    action: "ACCEPT" | "DECLINE",
    jobId?: number,
  ) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    setActingId(inviteId);
    setError(null);

    try {
      await axios.patch(
        `/api/freelancer/invites/${inviteId}`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (action === "ACCEPT" && jobId) {
        router.push(`/freelancer/jobs/${jobId}/apply`);
        return;
      }

      await fetchInvites();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to update invite");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setActingId(null);
    }
  };

  const clientName = (inv: InviteWithDetails) =>
    `${inv.invitedBy.firstName} ${inv.invitedBy.lastName}`.trim() || "Client";

  return (
    <div className="min-h-screen bg-white text-black">
      <FreelancerNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-6 flex flex-1 flex-col gap-6">
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600">
                Job invites
              </p>
              <h1 className="text-xl font-semibold text-black sm:text-2xl">
                Invites from clients
              </h1>
              <p className="text-sm text-gray-600">
                {loading
                  ? "Loading…"
                  : invites.length === 0
                    ? "When clients invite you to a job, invites appear here."
                    : `${invites.length} invite${invites.length === 1 ? "" : "s"}`}
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
                  Loading invites…
                </p>
              </div>
            ) : invites.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                  ✉️
                </div>
                <p className="text-sm font-medium text-black">No invites yet</p>
                <p className="mt-1 max-w-sm text-[14px] text-gray-600">
                  When a client invites you to apply for a job, it will show up
                  here. You can accept to go to the job and submit a proposal,
                  or decline.
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
                {invites.map((inv) => (
                  <li
                    key={inv.id}
                    className="rounded-2xl border border-gray-200/80 bg-white/70 px-3 py-3 sm:px-4 sm:py-3.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/freelancer/jobs/${inv.job.id}`}
                            className="text-sm font-semibold text-black hover:text-emerald-600"
                          >
                            {inv.job.title}
                          </Link>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${statusStyle(inv.status)}`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-[14px] font-medium text-emerald-700">
                          Invited by {clientName(inv)}
                        </p>
                        <p className="line-clamp-2 whitespace-pre-wrap text-[14px] text-gray-600">
                          {inv.job.description}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[14px] text-gray-600">
                          <span className="font-medium text-emerald-700">
                            ${inv.job.budget}{" "}
                            {inv.job.budgetType === "FIXED" ? "fixed" : "/hr"}
                          </span>
                          <span>·</span>
                          <span>Invited {formatDate(inv.createdAt)}</span>
                        </div>
                      </div>
                      {inv.status === "PENDING" && (
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleRespond(inv.id, "ACCEPT", inv.job.id)
                            }
                            disabled={actingId === inv.id}
                            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
                          >
                            {actingId === inv.id ? "…" : "Accept & apply"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRespond(inv.id, "DECLINE")}
                            disabled={actingId === inv.id}
                            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-[14px] font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                          >
                            {actingId === inv.id ? "…" : "Decline"}
                          </button>
                        </div>
                      )}
                      {inv.status === "ACCEPTED" && (
                        <Link
                          href={`/freelancer/jobs/${inv.job.id}/apply`}
                          className="shrink-0 rounded-full border border-emerald-500 px-4 py-2 text-[14px] font-medium text-emerald-700 transition hover:bg-emerald-50"
                        >
                          View job / Apply
                        </Link>
                      )}
                    </div>

                    {inv.message && (
                      <div className="mt-2 rounded-xl bg-gray-50 px-3 py-2">
                        <p className="text-[12px] font-medium uppercase tracking-wider text-gray-500">
                          Message from client
                        </p>
                        <p className="mt-1 text-[14px] text-gray-700">
                          {inv.message}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <BackButton href="/freelancer/dashboard">
            Back to dashboard
          </BackButton>
        </main>
      </div>
    </div>
  );
}
