"use client";

import Link from "next/link";
import BackButton from "../../../components/BackButton";
import { notFound, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatJobDateLabel } from "../../../data/jobs";
import type { Job } from "../../../data/jobs";
import FreelancerNavbar from "../../../components/FreelancerNavbar";
import axios from "axios";

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export default function FreelancerJobDetailPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [appliedCheckDone, setAppliedCheckDone] = useState(false);

  const jobIdNum = params.id != null ? parseInt(String(params.id), 10) : NaN;
  const validJobId = !Number.isNaN(jobIdNum) && jobIdNum >= 1;

  const fetchJob = useCallback(async () => {
    if (!params.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`/api/freelancer/jobs/${params.id}`);
      setJob(res.data as Job);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setJob(null);
          return;
        }
        setError("Failed to load job");
      } else {
        setError("Something went wrong");
      }
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const checkSaved = useCallback(async () => {
    if (!validJobId) return;

    try {
      const res = await axios.get(`/api/freelancer/saved-jobs/check`, {
        params: { jobId: jobIdNum },
        headers: getAuthHeaders(),
      });
      setSaved(!!res.data?.saved);
    } catch {
      setSaved(false);
    }
  }, [jobIdNum, validJobId]);

  const checkAlreadyApplied = useCallback(async () => {
    if (!validJobId) return;

    try {
      const res = await axios.get(`/api/freelancer/proposals/check`, {
        params: { jobId: jobIdNum },
        headers: getAuthHeaders(),
      });
      setAlreadyApplied(!!res.data?.applied);
    } catch {
      setAlreadyApplied(false);
    } finally {
      setAppliedCheckDone(true);
    }
  }, [jobIdNum, validJobId]);

  useEffect(() => {
    if (job) checkSaved();
  }, [job, checkSaved]);

  useEffect(() => {
    if (job && validJobId) checkAlreadyApplied();
  }, [job, validJobId, checkAlreadyApplied]);

  const handleSaveToggle = async () => {
    if (!params.id || !validJobId || saving) return;

    setSaving(true);
    try {
      if (saved) {
        await axios.delete("/api/freelancer/saved-jobs", {
          params: { jobId: jobIdNum },
          headers: getAuthHeaders(),
        });

        setSaved(false);
        window.dispatchEvent(new CustomEvent("savedJobsCountChange"));
      } else {
        await axios.post(
          "/api/freelancer/saved-jobs",
          { jobId: jobIdNum },
          { headers: getAuthHeaders() },
        );

        setSaved(true);
        window.dispatchEvent(new CustomEvent("savedJobsCountChange"));
      }
    } catch {
      // keep current saved state
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black">
        <FreelancerNavbar />
        <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-3xl rounded-full bg-emerald-500/10 blur-3xl" />
          <main className="relative z-10 mt-6 flex flex-1 flex-col gap-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm font-medium text-gray-600">Loading job…</p>
            </div>
            <Link
              href="/freelancer/jobs"
              className="text-[14px] text-gray-600 hover:text-emerald-600"
            >
              ← Back to all jobs
            </Link>
          </main>
        </div>
      </div>
    );
  }

  if (!loading && !job) {
    return (
      <div className="min-h-screen bg-white text-black">
        <FreelancerNavbar />
        <div className="mx-auto max-w-3xl p-6 text-center">
          <h2 className="text-lg font-semibold">Job not available</h2>
          <p className="mt-2 text-gray-600">
            This job may have been closed or removed.
          </p>
          <BackButton href="/freelancer/proposals">
            Back to proposals
          </BackButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <FreelancerNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-3xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-6 flex flex-1 flex-col gap-6">
          <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-5 text-xs text-gray-700 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-[14px] font-medium uppercase tracking-[0.22em] text-emerald-600">
                  Job overview
                </p>
                <h1 className="text-lg font-semibold text-black sm:text-xl">
                  {job?.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-[14px] text-gray-600">
                  {/* <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                    {job?.category}
                  </span> */}
                  <span>
                    {job?.budgetType === "fixed"
                      ? `$${job?.budget} fixed`
                      : `$${job?.budget}/hr`}
                  </span>
                  <span>•</span>
                  <span className="capitalize">
                    {job?.experienceLevel} level
                  </span>
                  <span>•</span>
                  <span>Posted {formatJobDateLabel(job?.createdAt ?? "")}</span>
                </div>
              </div>

              <div className="space-y-1 text-right text-[14px] text-gray-600">
                <p className="font-medium text-black">{job?.client.name}</p>
                <p>{job?.client.location}</p>
                <p>
                  {job?.client.jobsPosted} jobs · {job?.client.hireRate}% hire
                  rate
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Description
                  </h2>
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-gray-700">
                    {job?.description}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Required skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5 text-[14px] text-gray-700">
                    {job?.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-gray-100 px-2 py-0.5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-[14px] text-gray-700 shadow-sm sm:p-5">
                <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  Submit proposal
                </p>
                <p className="text-[14px] text-gray-600">
                  Submit a proposal with your cover letter, fixed bid, and
                  timeline.
                </p>

                <div className="space-y-2 rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-[14px] font-medium text-black">
                    Budget &amp; type
                  </p>
                  <p className="text-sm font-semibold text-emerald-600">
                    {job?.budgetType === "fixed"
                      ? `$${job?.budget} fixed`
                      : `$${job?.budget}/hour`}
                  </p>
                  <p className="text-[14px] text-gray-600">
                    {job?.experienceLevel === "entry"
                      ? "Good for new freelancers."
                      : job?.experienceLevel === "intermediate"
                        ? "Intermediate experience recommended."
                        : "Best suited for highly experienced freelancers."}
                  </p>
                </div>

                <div className="space-y-2">
                  {appliedCheckDone && alreadyApplied ? (
                    <div className="flex w-full items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-[14px] font-medium text-emerald-800">
                      Already applied
                    </div>
                  ) : (
                    <Link
                      href={`/freelancer/jobs/${params.id}/apply`}
                      className="flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
                    >
                      Apply to this job
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveToggle}
                    disabled={saving}
                    className={`flex w-full items-center justify-center rounded-full px-4 py-2 text-[14px] font-medium transition disabled:opacity-60 ${
                      saved
                        ? "border border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border border-gray-300 text-gray-700 hover:border-emerald-500 hover:bg-gray-50"
                    }`}
                  >
                    {saving ? "…" : saved ? "Saved" : "Save job"}
                  </button>
                </div>

                <p className="text-[14px] text-gray-600">
                  Tip: tailor your proposal to the description and required
                  skills.
                </p>
              </aside>
            </div>
          </section>

          <BackButton href="/freelancer/jobs">Back to all jobs</BackButton>
        </main>
      </div>
    </div>
  );
}
