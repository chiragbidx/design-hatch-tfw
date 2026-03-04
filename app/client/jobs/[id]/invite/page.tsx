"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ClientNavbar from "../../../../components/ClientNavbar";
import BackButton from "../../../../components/BackButton";
import { useEffect, useState } from "react";
import axios from "axios";

interface JobInfo {
  id: number;
  title: string;
  status: string;
  budget: number;
  budgetType: string;
}

interface FreelancerOption {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  location: string | null;
  profile: {
    id: number;
    bio: string | null;
    hourlyRate: number | null;
    experienceStat: string | null;
    avatarUrl: string | null;
    skills: { name: string }[];
  } | null;
}

export default function ClientJobInvitePage() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const [job, setJob] = useState<JobInfo | null>(null);
  const [freelancers, setFreelancers] = useState<FreelancerOption[]>([]);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingFreelancers, setLoadingFreelancers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [sentId, setSentId] = useState<number | null>(null);
  const [alreadyInvitedId, setAlreadyInvitedId] = useState<number | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token || !jobId) return;
    axios
      .get(`/api/client/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setJob(res.data);
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          return;
        }
        setError("Failed to load job");
      })
      .finally(() => setLoadingJob(false));
  }, [token, jobId]);

  useEffect(() => {
    if (!token) return;
    axios
      .get("/api/client/freelancers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFreelancers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setFreelancers([]))
      .finally(() => setLoadingFreelancers(false));
  }, [token]);

  const handleSendInvite = async (freelancerId: number) => {
    if (!token || !jobId) return;
    setInviteError(null);
    setSentId(null);
    setAlreadyInvitedId(null);
    setSendingId(freelancerId);
    try {
      const res = await fetch("/api/client/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: parseInt(String(jobId), 10),
          freelancerId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setAlreadyInvitedId(freelancerId);
          setInviteError("You have already invited this freelancer to this job.");
        } else {
          setInviteError(data.error || "Failed to send invite");
        }
        return;
      }
      setSentId(freelancerId);
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setSendingId(null);
    }
  };

  const freelancerName = (f: FreelancerOption) =>
    `${f.firstName} ${f.lastName}`.trim() || f.email;
  const skillsList = (f: FreelancerOption) =>
    f.profile?.skills?.map((s) => s.name).join(", ") || "—";

  const loading = loadingJob || loadingFreelancers;

  return (
    <div className="min-h-screen bg-white text-black">
      <ClientNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-10 flex flex-1 flex-col gap-6">
          {/* Job context */}
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3">
            {loadingJob ? (
              <p className="text-[14px] text-gray-600">Loading job…</p>
            ) : job ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-emerald-700">
                    Inviting freelancers to
                  </p>
                  <p className="text-sm font-semibold text-black">{job.title}</p>
                  <p className="text-[14px] text-gray-600">
                    ${job.budget}{" "}
                    {job.budgetType === "FIXED" ? "fixed" : "/hr"}
                  </p>
                </div>
                <Link
                  href="/client/jobs"
                  className="text-[14px] font-medium text-emerald-700 hover:text-emerald-800"
                >
                  ← Change job
                </Link>
              </div>
            ) : (
              <p className="text-[14px] text-red-600">
                Job not found or you don’t have access.
              </p>
            )}
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
            >
              {error}
            </div>
          )}

          <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold text-black">
              Freelancers
            </h2>
            <p className="mt-0.5 text-[14px] text-gray-600">
              Invite freelancers directly from this list to your job.
            </p>

            {inviteError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[14px] text-red-800">
                {inviteError}
              </div>
            )}

            {loading ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center text-sm text-gray-600">
                Loading…
              </div>
            ) : !job ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-[14px] text-gray-600">
                Load a job first.
              </div>
            ) : freelancers.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                <p className="text-sm font-medium text-black">
                  No freelancers found
                </p>
                <p className="mt-1 text-[14px] text-gray-600">
                  There are no freelancers on the platform yet.
                </p>
              </div>
            ) : (
              <ul className="mt-6 space-y-3">
                {freelancers.map((f) => (
                  <li
                    key={f.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-4 sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-black">
                        {freelancerName(f)}
                      </p>
                      {f.profile?.bio && (
                        <p className="mt-0.5 line-clamp-2 text-[14px] text-gray-600">
                          {f.profile.bio}
                        </p>
                      )}
                      <p className="mt-1 text-[12px] text-gray-500">
                        {skillsList(f)}
                        {f.profile?.hourlyRate != null && (
                          <span className="ml-2 font-medium text-emerald-700">
                            · ${f.profile.hourlyRate}/hr
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSendInvite(f.id)}
                      disabled={sendingId === f.id}
                      className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold text-white transition ${
                        sentId === f.id
                          ? "bg-emerald-600"
                          : alreadyInvitedId === f.id
                          ? "bg-amber-500"
                          : "bg-emerald-500 hover:bg-emerald-400"
                      } disabled:opacity-60`}
                    >
                      {sendingId === f.id
                        ? "Sending…"
                        : sentId === f.id
                        ? "Invite sent"
                        : alreadyInvitedId === f.id
                        ? "Already invited"
                        : "Invite to job"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <BackButton href="/client/jobs">Back to my jobs</BackButton>
        </main>
      </div>
    </div>
  );
}
