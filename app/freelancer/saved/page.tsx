"use client";

import Link from "next/link";
import BackButton from "../../components/BackButton";
import { useCallback, useEffect, useState } from "react";
import type { Job } from "@/app/data/jobs";
import FreelancerNavbar from "@/app/components/FreelancerNavbar";
import JobCard from "@/app/components/JobCard";
import axios from "axios";

export default function FreelancerSavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await axios.get("/api/freelancer/saved-jobs", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSavedJobs(Array.isArray(res.data.savedJobs) ? res.data.savedJobs : []);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 401) {
          setSavedJobs([]);
          setLoading(false);
          return;
        }
        setError(e.response?.data?.error || "Failed to load saved jobs");
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleUnsave = async (jobId: string) => {
    const numId = parseInt(jobId, 10);
    if (Number.isNaN(numId)) return;
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await axios.delete("/api/freelancer/saved-jobs", {
        params: { jobId: numId },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("savedJobsCountChange"));
      }
    } catch {
      setError("Failed to unsave job");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <FreelancerNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-6 flex flex-1 flex-col gap-6">
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600">
                Saved jobs
              </p>
              <h1 className="text-xl font-semibold text-black sm:text-2xl">
                Jobs you saved for later
              </h1>
              <p className="text-sm text-gray-600">
                {loading
                  ? "Loading…"
                  : savedJobs.length === 0
                    ? "Save jobs from Find work to see them here."
                    : `${savedJobs.length} job${savedJobs.length === 1 ? "" : "s"} saved`}
              </p>
            </div>

            <Link
              href="/freelancer/jobs"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
            >
              Browse jobs
            </Link>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-4 text-[12px] text-gray-700 shadow-sm sm:p-5">
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-800"
              >
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                <p className="text-sm font-medium text-gray-600">
                  Loading saved jobs…
                </p>
              </div>
            ) : savedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                  🔖
                </div>
                <p className="text-sm font-medium text-black">No saved jobs</p>
                <p className="mt-1 max-w-sm text-[12px] text-gray-600">
                  When you find a job you like, click &quot;Save job&quot; on the job
                  page. It will appear here so you can apply later.
                </p>
                <Link
                  href="/freelancer/jobs"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-emerald-400"
                >
                  Find work
                </Link>
              </div>
            ) : (
              <ul className="grid gap-4 sm:gap-5">
                {savedJobs.map((job) => (
                  <li key={job.id}>
                    <JobCard
                      job={job}
                      variant="saved"
                      onUnsave={handleUnsave}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <BackButton href="/freelancer/jobs">Back to all jobs</BackButton>
        </main>
      </div>
    </div>
  );
}
