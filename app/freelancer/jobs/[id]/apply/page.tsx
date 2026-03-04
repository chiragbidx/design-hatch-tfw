"use client";

import Link from "next/link";
import BackButton from "../../../../components/BackButton";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FreelancerNavbar from "../../../../components/FreelancerNavbar";
import axios from "axios";

const COVER_LETTER_MIN = 100;
const COVER_LETTER_MAX = 5000;
const TIMELINE_OPTIONS = [
  "Less than 1 week",
  "1–2 weeks",
  "2–4 weeks",
  "1–3 months",
  "3+ months",
];

export default function FreelancerApplyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = useState<any | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [jobError, setJobError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [timeline, setTimeline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [appliedCheckDone, setAppliedCheckDone] = useState(false);

  const jobIdNum =
    params.id != null ? parseInt(String(params.id), 10) : NaN;
  const validJobId = !Number.isNaN(jobIdNum) && jobIdNum >= 1;

  useEffect(() => {
    if (!params.id) {
      setLoadingJob(false);
      setJob(null);
      return;
    }

    const fetchJob = async () => {
      setLoadingJob(true);
      setJobError(null);
      try {
        const res = await axios.get(`/api/freelancer/jobs/${params.id}`);
        setJob(res.data);
      } catch (err: any) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setJob(null);
        } else {
          setJobError("Failed to load job");
        }
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJob();
  }, [params.id]);

  useEffect(() => {
    if (!validJobId) {
      setAppliedCheckDone(true);
      return;
    }
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAppliedCheckDone(true);
      return;
    }
    axios
      .get(`/api/freelancer/proposals/check`, {
        params: { jobId: jobIdNum },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAlreadyApplied(!!res.data?.applied);
      })
      .catch(() => setAlreadyApplied(false))
      .finally(() => setAppliedCheckDone(true));
  }, [jobIdNum, validJobId]);

  const jobBudgetHint =
    job && job.budgetType === "fixed" ? job.budget : undefined;
  const coverLetterLen = coverLetter.length;
  const coverLetterValid =
    coverLetterLen >= COVER_LETTER_MIN && coverLetterLen <= COVER_LETTER_MAX;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const bid = parseInt(bidAmount, 10);
    if (!coverLetter.trim()) {
      setError("Please write a cover letter.");
      return;
    }
    if (coverLetterLen < COVER_LETTER_MIN) {
      setError(`Cover letter must be at least ${COVER_LETTER_MIN} characters.`);
      return;
    }
    if (coverLetterLen > COVER_LETTER_MAX) {
      setError(`Cover letter must be no more than ${COVER_LETTER_MAX} characters.`);
      return;
    }
    if (Number.isNaN(bid) || bid <= 0) {
      setError("Please enter a valid fixed price (e.g. 500).");
      return;
    }
    if (!timeline.trim()) {
      setError("Please select an estimated timeline.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setError("You must be logged in to submit a proposal.");
        setIsSubmitting(false);
        return;
      }

      await axios.post(
        "/api/freelancer/proposals",
        {
          jobId: parseInt(params.id, 10),
          coverLetter: coverLetter.trim(),
          bidAmount: bid,
          timeline: timeline.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      router.push("/freelancer/dashboard?proposal=submitted");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.status === 409
            ? err.response?.data?.error || "You have already applied to this job."
            : err.response?.data?.error || "Failed to submit proposal";
        setError(message);
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="min-h-screen bg-white text-black">
        <FreelancerNavbar />
        <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-3xl rounded-full bg-emerald-500/10 blur-3xl" />
          <main className="relative z-10 mt-6 flex flex-1 flex-col gap-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm font-medium text-gray-600">
                Loading job…
              </p>
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

  if (jobError || !job) {
    return (
      <div className="min-h-screen bg-white text-black">
        <FreelancerNavbar />
        <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-3xl rounded-full bg-emerald-500/10 blur-3xl" />
          <main className="relative z-10 mt-6 flex flex-1 flex-col gap-6">
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-medium text-red-800">
                {jobError ?? "Job not found"}
              </p>
              <BackButton href="/freelancer/jobs">Back to all jobs</BackButton>
            </div>
          </main>
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
          {/* breadcrumb */}
          <nav className="flex items-center gap-2 text-[14px] text-gray-600">
            <Link href="/freelancer/jobs" className="hover:text-emerald-600">
              Jobs
            </Link>
            <span aria-hidden>/</span>
            <Link
              href={`/freelancer/jobs/${params.id}`}
              className="hover:text-emerald-600"
            >
              {job.title}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-black">Submit proposal</span>
          </nav>

          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <h1 className="text-lg font-semibold text-black sm:text-xl">
              Submit a proposal
            </h1>
            <p className="mt-1 text-[14px] text-gray-600">
              Fixed price only. Describe your approach and your bid.
            </p>

            {appliedCheckDone && alreadyApplied && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-[14px] text-amber-900"
              >
                <p className="font-semibold">You have already applied to this job.</p>
                <p className="mt-1 text-amber-800">
                  You can view and manage your proposal from your proposals page.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/freelancer/proposals"
                    className="inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-amber-500"
                  >
                    View my proposals
                  </Link>
                  <BackButton href={`/freelancer/jobs/${params.id}`}>
                    Back to job
                  </BackButton>
                </div>
              </div>
            )}

            {(!appliedCheckDone || !alreadyApplied) && (
            <>
            {/* job summary card */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-[14px] text-gray-700 sm:p-5">
              <p className="font-semibold text-black">{job.title}</p>
              <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-gray-600">{job.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                  {job.category}
                </span>
                <span>
                  {job.budgetType === "fixed"
                    ? `$${job.budget} fixed`
                    : `$${job.budget}/hr`}
                </span>
                <span>•</span>
                <span className="capitalize">{job.experienceLevel}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
                >
                  {error}
                </div>
              )}

              {/* Cover letter / Description */}
              <div className="space-y-2">
                <label
                  htmlFor="coverLetter"
                  className="block text-[14px] font-semibold uppercase tracking-[0.12em] text-emerald-600"
                >
                  Cover letter
                </label>
                <p className="text-[14px] text-gray-600">
                  Introduce yourself and explain why you’re a good fit. Reference
                  the job description and skills.
                </p>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  required
                  minLength={COVER_LETTER_MIN}
                  maxLength={COVER_LETTER_MAX}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="e.g. I’ve built several SaaS landing pages with Next.js and Tailwind. I can deliver a fast, responsive page that matches your brand and converts."
                  className="min-h-45 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-[14px] text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  rows={8}
                />
                <div className="flex justify-between text-[12px] text-gray-500">
                  <span>
                    {coverLetterLen < COVER_LETTER_MIN
                      ? `${COVER_LETTER_MIN - coverLetterLen} more characters needed`
                      : "Minimum length met"}
                  </span>
                  <span
                    className={
                      coverLetterLen > COVER_LETTER_MAX ? "text-red-600" : ""
                    }
                  >
                    {coverLetterLen} / {COVER_LETTER_MAX}
                  </span>
                </div>
              </div>

              {/* Fixed bid amount */}
              <div className="space-y-2">
                <label
                  htmlFor="bidAmount"
                  className="block text-[14px] font-semibold uppercase tracking-[0.12em] text-emerald-600"
                >
                  Your bid (fixed price)
                </label>
                <p className="text-[14px] text-gray-600">
                  Total amount you’ll charge for this project. Fixed price only.
                </p>
                <div className="flex items-center gap-2">
                  <span className="rounded-l-xl border border-r-0 border-gray-300 bg-gray-100 px-4 py-3 text-[14px] font-medium text-gray-700">
                    $
                  </span>
                  <input
                    id="bidAmount"
                    name="bidAmount"
                    type="number"
                    min={1}
                    step={1}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full max-w-50 rounded-r-xl border border-gray-300 bg-white px-4 py-3 text-[14px] text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                {jobBudgetHint && (
                  <p className="text-[12px] text-gray-500">
                    Client’s budget: ${jobBudgetHint} (fixed)
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <label
                  htmlFor="timeline"
                  className="block text-[14px] font-semibold uppercase tracking-[0.12em] text-emerald-600"
                >
                  Estimated duration
                </label>
                <p className="text-[14px] text-gray-600">
                  When can you deliver this project?
                </p>
                <select
                  id="timeline"
                  name="timeline"
                  required
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full max-w-md rounded-xl border border-gray-300 bg-white px-4 py-3 text-[14px] text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select duration</option>
                  {TIMELINE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !coverLetterValid}
                  className="rounded-full bg-emerald-500 px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.5)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting…" : "Submit proposal"}
                </button>
                <Link
                  href={`/freelancer/jobs/${params.id}`}
                  className="rounded-full border border-gray-300 px-6 py-2.5 text-[14px] font-medium text-gray-700 transition hover:border-emerald-500 hover:bg-gray-50"
                >
                  Cancel
                </Link>
              </div>
            </form>
            </>
            )}
          </section>

          <BackButton href="/freelancer/jobs">Back to all jobs</BackButton>
        </main>
      </div>
    </div>
  );
}
