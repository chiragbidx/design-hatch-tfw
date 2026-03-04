"use client";

import Link from "next/link";
import ClientNavbar from "../../components/ClientNavbar";
import BackButton from "../../components/BackButton";
import AlertModal from "../../components/AlertModal";
import { useEffect, useState } from "react";
import axios from "axios";

interface MyJob {
  id: number;
  title: string;
  status: string;
  budget: number;
  budgetType: string;
  createdAt: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ClientMyJobsPage() {
  const [jobs, setJobs] = useState<MyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [confirmCloseJobId, setConfirmCloseJobId] = useState<number | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchJobs = () => {
    if (!token) return;
    axios
      .get("/api/client/my-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setJobs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setJobs([]));
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get("/api/client/my-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setJobs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [token]);

  const runCloseJob = async (jobId: number) => {
    if (!token) return;
    setCloseError(null);
    setClosingId(jobId);
    try {
      await axios.patch(
        `/api/client/jobs/${jobId}/close`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "CLOSED" } : j))
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setCloseError(err.response?.data?.error || "Failed to close job");
      } else {
        setCloseError("Failed to close job");
      }
    } finally {
      setClosingId(null);
    }
  };

  const handleCloseJobClick = (jobId: number) => {
    setConfirmCloseJobId(jobId);
  };

  const handleConfirmCloseJob = () => {
    if (confirmCloseJobId !== null) {
      runCloseJob(confirmCloseJobId);
      setConfirmCloseJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <ClientNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-10 flex flex-1 flex-col gap-6">
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600">
                Your posted jobs
              </p>
              <h1 className="text-xl font-semibold text-black sm:text-2xl">
                My jobs
              </h1>
              <p className="text-sm text-gray-600">
                {loading
                  ? "Loading…"
                  : "Select a job to invite freelancers to apply."}
              </p>
            </div>

            <Link
              href="/client/jobpost"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
            >
              + Post new job
            </Link>
          </section>

          {closeError && (
            <div
              role="alert"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-800"
            >
              {closeError}
              <button
                type="button"
                onClick={() => setCloseError(null)}
                className="ml-2 font-medium underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center text-sm text-gray-600">
                Loading jobs…
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                <p className="text-sm font-medium text-black">No jobs yet</p>
                <p className="mt-1 text-[14px] text-gray-600">
                  Post a job first, then you can invite freelancers to it.
                </p>
                <Link
                  href="/client/jobpost"
                  className="mt-4 inline-flex rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-emerald-400"
                >
                  Post a job
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {jobs.map((job) => (
                  <li
                    key={job.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-4 sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-black">
                        {job.title}
                      </p>
                      <p className="mt-0.5 text-[14px] text-gray-600">
                        ${job.budget}{" "}
                        {job.budgetType === "FIXED" ? "fixed" : "/hr"} · Posted{" "}
                        {formatDate(job.createdAt)}
                        {job.status !== "OPEN" && (
                          <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-[12px] text-gray-600">
                            {job.status}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {job.status === "OPEN" && (
                        <>
                          <Link
                            href={`/client/jobs/${job.id}/invite`}
                            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-emerald-400"
                          >
                            Invite freelancers
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleCloseJobClick(job.id)}
                            disabled={closingId === job.id}
                            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                          >
                            {closingId === job.id ? "Closing…" : "Close job"}
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <BackButton href="/client/dashboard">Back to dashboard</BackButton>
        </main>

        <AlertModal
          open={confirmCloseJobId !== null}
          onClose={() => setConfirmCloseJobId(null)}
          title="Close job"
          message="Close this job? You can only close it after all milestone payments have been released."
          onConfirm={handleConfirmCloseJob}
          confirmLabel="Close job"
          cancelLabel="Cancel"
        />
      </div>
    </div>
  );
}
