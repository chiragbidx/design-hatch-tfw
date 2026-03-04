"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import ClientNavbar from "../../../components/ClientNavbar";
import BackButton from "../../../components/BackButton";
import { useEffect, useState } from "react";
import axios from "axios";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  contract: {
    job: {
      title: string;
    } | null;
  } | null;
}

interface FreelancerProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  location: string | null;
  avatarUrl: string | null;
  averageRating?: number | null;
  reviewCount?: number;
  reviews?: Review[];
  profile: {
    id: number;
    bio: string | null;
    hourlyRate: number | null;
    experienceStat: string | null;
    completedJobs: string | null;
    jobSuccess: string | null;
    availability: string | null;
    timezone: string | null;
    responseTime: string | null;
    skills: { name: string }[];
    experience: {
      id: number;
      title: string;
      org: string;
      period: string | null;
      details: string | null;
    }[];
    portfolio: {
      id: number;
      title: string;
      link: string | null;
      role: string | null;
      result: string | null;
    }[];
  } | null;
}

interface JobOption {
  id: number;
  title: string;
  status: string;
  budget: number;
  budgetType: string;
}

export default function ClientFreelancerProfilePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const jobIdFromQuery = searchParams.get("jobId");

  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [job, setJob] = useState<JobOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [alreadyInvited, setAlreadyInvited] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!params.id || !token) {
      setLoading(false);
      return;
    }
    axios
      .get(`/api/client/freelancers/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFreelancer(res.data))
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setFreelancer(null);
          return;
        }
        setError("Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [params.id, token]);

  useEffect(() => {
    if (!jobIdFromQuery || !token) return;
    axios
      .get(`/api/client/jobs/${jobIdFromQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setJob(res.data))
      .catch(() => setJob(null));
  }, [jobIdFromQuery, token]);

  const handleSendInvite = async () => {
    if (!freelancer || !jobIdFromQuery || !token) return;
    setError(null);
    setSuccess(null);
    setSending(true);
    try {
      await axios.post(
        "/api/client/invites",
        {
          jobId: parseInt(jobIdFromQuery, 10),
          freelancerId: freelancer.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Invite sent successfully.");
      setAlreadyInvited(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setAlreadyInvited(true);
          setError("You have already invited this freelancer to this job.");
        } else {
          setError(err.response?.data?.error || "Failed to send invite");
        }
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSending(false);
    }
  };

  const name =
    freelancer &&
    `${freelancer.firstName} ${freelancer.lastName}`.trim();
  const displayName = name || freelancer?.email || "Freelancer";

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black">
        <ClientNavbar />
        <div className="mx-auto flex min-h-screen flex-col items-center justify-center px-6 py-10">
          <p className="text-sm text-gray-600">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-white text-black">
        <ClientNavbar />
        <div className="mx-auto flex min-h-screen flex-col items-center justify-center gap-4 px-6">
          <p className="text-sm text-gray-600">Freelancer not found.</p>
          <BackButton href="/client/jobs">Back to my jobs</BackButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <ClientNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-10 flex flex-1 flex-col gap-6">
          {/* Invite CTA (when job context exists) */}
          {jobIdFromQuery && job && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-emerald-700">
                    Invite to job
                  </p>
                  <p className="text-sm font-semibold text-black">{job.title}</p>
                  <p className="text-[14px] text-gray-600">
                    ${job.budget} {job.budgetType === "FIXED" ? "fixed" : "/hr"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {success ? (
                    <span className="rounded-full bg-emerald-200 px-4 py-2 text-[14px] font-semibold text-emerald-900">
                      Invite sent
                    </span>
                  ) : alreadyInvited ? (
                    <span className="rounded-full bg-amber-100 px-4 py-2 text-[14px] font-medium text-amber-800">
                      Already invited
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendInvite}
                      disabled={sending}
                      className="rounded-full bg-emerald-500 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_30px_rgba(16,185,129,0.4)] transition hover:bg-emerald-400 disabled:opacity-60"
                    >
                      {sending ? "Sending…" : "Send invite"}
                    </button>
                  )}
                </div>
              </div>
              {error && (
                <p className="mt-2 text-[14px] text-red-600">{error}</p>
              )}
            </section>
          )}

          {!jobIdFromQuery && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3">
              <p className="text-[14px] text-amber-900">
                To invite this freelancer to a job, go to{" "}
                <Link href="/client/jobs" className="font-semibold text-amber-800 underline">
                  My jobs
                </Link>
                , choose a job, then &quot;Invite freelancers&quot; and open this
                profile from the list.
              </p>
            </section>
          )}

          {/* Profile card */}
          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="flex flex-wrap gap-6">
              <div className="shrink-0">
                {freelancer.avatarUrl ? (
                  <img
                    src={freelancer.avatarUrl}
                    alt=""
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-semibold text-emerald-700">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-black">
                  {displayName}
                </h1>
                {freelancer.location && (
                  <p className="mt-0.5 text-[14px] text-gray-600">
                    {freelancer.location}
                  </p>
                )}
                {freelancer.averageRating != null &&
                  typeof freelancer.reviewCount === "number" &&
                  freelancer.reviewCount > 0 && (
                    <p className="mt-0.5 text-[14px] text-emerald-700">
                      {freelancer.averageRating.toFixed(1)} ★ ·{" "}
                      {freelancer.reviewCount} review
                      {freelancer.reviewCount === 1 ? "" : "s"}
                    </p>
                  )}
                {freelancer.profile?.hourlyRate != null && (
                  <p className="mt-1 text-sm font-semibold text-emerald-600">
                    ${freelancer.profile.hourlyRate}/hr
                  </p>
                )}
                {freelancer.profile?.experienceStat && (
                  <p className="mt-0.5 text-[14px] text-gray-600">
                    {freelancer.profile.experienceStat}
                  </p>
                )}
              </div>
            </div>

            {!freelancer.profile && (
              <p className="mt-6 text-sm text-gray-500">
                This freelancer has not added profile details yet.
              </p>
            )}

            {freelancer.profile?.bio && (
              <div className="mt-6">
                <h2 className="text-[14px] font-semibold uppercase tracking-wider text-emerald-600">
                  About
                </h2>
                <p className="mt-1.5 text-sm text-gray-700 whitespace-pre-wrap">
                  {freelancer.profile.bio}
                </p>
              </div>
            )}

            {freelancer.profile?.skills?.length ? (
              <div className="mt-6">
                <h2 className="text-[14px] font-semibold uppercase tracking-wider text-emerald-600">
                  Skills
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {freelancer.profile.skills.map((s) => (
                    <span
                      key={s.name}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-[14px] font-medium text-emerald-800"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {freelancer.profile?.experience?.length ? (
              <div className="mt-6">
                <h2 className="text-[14px] font-semibold uppercase tracking-wider text-emerald-600">
                  Experience
                </h2>
                <ul className="mt-2 space-y-3">
                  {freelancer.profile.experience.map((exp) => (
                    <li
                      key={exp.id}
                      className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2"
                    >
                      <p className="text-sm font-semibold text-black">
                        {exp.title} · {exp.org}
                      </p>
                      {exp.period && (
                        <p className="text-[12px] text-gray-500">
                          {exp.period}
                        </p>
                      )}
                      {exp.details && (
                        <p className="mt-1 text-[14px] text-gray-600">
                          {exp.details}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {freelancer.profile?.portfolio?.length ? (
              <div className="mt-6">
                <h2 className="text-[14px] font-semibold uppercase tracking-wider text-emerald-600">
                  Portfolio
                </h2>
                <ul className="mt-2 space-y-2">
                  {freelancer.profile.portfolio.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2"
                    >
                      <p className="text-sm font-semibold text-black">
                        {item.title}
                        {item.role && ` · ${item.role}`}
                      </p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 text-[14px] text-emerald-600 hover:underline"
                        >
                          {item.link}
                        </a>
                      )}
                      {item.result && (
                        <p className="mt-0.5 text-[14px] text-gray-600">
                          {item.result}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Reviews from clients */}
            {typeof freelancer.reviewCount === "number" &&
              freelancer.reviewCount > 0 &&
              Array.isArray(freelancer.reviews) && (
                <div className="mt-6">
                  <h2 className="text-[14px] font-semibold uppercase tracking-wider text-emerald-600">
                    Reviews from clients
                  </h2>
                  <p className="mt-0.5 text-[14px] text-gray-600">
                    {freelancer.averageRating != null
                      ? freelancer.averageRating.toFixed(1)
                      : "–"}{" "}
                    ★ · {freelancer.reviewCount} review
                    {freelancer.reviewCount === 1 ? "" : "s"}
                  </p>
                  <ul className="mt-2 space-y-3">
                    {freelancer.reviews.map((review) => {
                      const reviewerName =
                        `${review.reviewer.firstName || ""} ${
                          review.reviewer.lastName || ""
                        }`.trim() || review.reviewer.email;
                      const jobTitle = review.contract?.job?.title;
                      return (
                        <li
                          key={review.id}
                          className="space-y-1.5 rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[14px] font-medium text-black">
                              {reviewerName}
                              {jobTitle ? ` · ${jobTitle}` : ""}
                            </p>
                            <p className="text-[14px] font-semibold text-emerald-700">
                              {review.rating.toFixed(1)} ★
                            </p>
                          </div>
                          {review.comment && (
                            <p className="text-[14px] text-gray-700">
                              {review.comment}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
          </section>

          <BackButton
            href={jobIdFromQuery ? `/client/jobs/${jobIdFromQuery}/invite` : "/client/jobs"}
          >
            Back to {jobIdFromQuery ? "freelancer list" : "my jobs"}
          </BackButton>
        </main>
      </div>
    </div>
  );
}
