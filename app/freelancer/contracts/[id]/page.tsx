"use client";

import Link from "next/link";
import BackButton from "../../../components/BackButton";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import FreelancerNavbar from "@/app/components/FreelancerNavbar";
import axios from "axios";

type MilestoneStatus =
  | "PENDING"
  | "FUNDED"
  | "SUBMITTED"
  | "APPROVED"
  | "RELEASED";

interface MilestoneWithPayment {
  id: number;
  title: string;
  amount: number;
  status: MilestoneStatus;
  submissionNote: string | null;
  submittedAt: string | null;
  createdAt: string;
  payment: { id: number; status: string } | null;
}

interface ContractDetail {
  id: number;
  status: string;
  createdAt: string;
  job: { id: number; title: string; description: string; budget: number };
  client: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  milestones: MilestoneWithPayment[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function milestoneStatusStyle(status: MilestoneStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
    case "FUNDED":
      return "bg-blue-50 text-blue-800 ring-1 ring-blue-200";
    case "SUBMITTED":
      return "bg-purple-50 text-purple-800 ring-1 ring-purple-200";
    case "RELEASED":
      return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function FreelancerContractDetailPage() {
  const params = useParams<{ id: string }>();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [submitNote, setSubmitNote] = useState("");
  const [submitModalMilestone, setSubmitModalMilestone] =
    useState<MilestoneWithPayment | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchContract = useCallback(async () => {
    if (!params.id || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/freelancer/contracts/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContract(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setContract(null);
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setContract(null);
      }
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const handleSubmitMilestone = async () => {
    if (!token || !submitModalMilestone) return;
    setActionError(null);
    setSubmittingId(submitModalMilestone.id);
    try {
      await axios.post(
        "/api/freelancer/milestones/submit",
        {
          milestoneId: submitModalMilestone.id,
          submissionNote: submitNote.trim() || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Work submitted. Client can now approve and release payment.");
      setSubmitModalMilestone(null);
      setSubmitNote("");
      await fetchContract();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setActionError(err.response?.data?.error || "Failed to submit");
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to submit");
      }
    } finally {
      setSubmittingId(null);
    }
  };

  const clientName = contract
    ? `${contract.client.firstName} ${contract.client.lastName}`.trim() ||
      contract.client.email
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black">
        <FreelancerNavbar />
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-gray-600">Loading contract…</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-white text-black">
        <FreelancerNavbar />
        <div className="mx-auto flex min-h-screen flex-col items-center justify-center gap-4 px-6">
          <p className="text-sm text-gray-600">Contract not found.</p>
          <BackButton href="/freelancer/contracts">Back to contracts</BackButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <FreelancerNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-6 flex flex-1 flex-col gap-6">
          {/* Contract header */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h1 className="text-lg font-semibold text-black">
              {contract.job.title}
            </h1>
            <p className="mt-0.5 text-[14px] text-gray-600">
              Client: {clientName} · Started {formatDate(contract.createdAt)} ·{" "}
              {contract.status}
            </p>
            {contract.job.description && (
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[14px] text-gray-600">
                {contract.job.description}
              </p>
            )}
          </section>

          {actionError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
            >
              {actionError}
            </div>
          )}
          {success && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-800"
            >
              {success}
            </div>
          )}

          {/* Milestones */}
          <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold text-black">Milestones</h2>
            <p className="mt-0.5 text-[14px] text-gray-600">
              When a milestone is funded by the client, you can submit your work.
              After you submit, the client approves and releases payment.
            </p>

            {contract.milestones.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center text-[14px] text-gray-600">
                No milestones yet. The client will add and fund them.
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {contract.milestones.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-black">
                          {m.title}
                        </p>
                        <p className="mt-0.5 text-[14px] text-gray-600">
                          ${m.amount}
                          <span
                            className={`ml-2 rounded-full px-2 py-0.5 text-[12px] font-medium ${milestoneStatusStyle(m.status)}`}
                          >
                            {m.status}
                          </span>
                        </p>
                        {m.submissionNote && (
                          <div className="mt-2 rounded-xl bg-white p-2 text-[14px] text-gray-700">
                            <span className="font-medium text-gray-500">
                              Your submission:
                            </span>{" "}
                            {m.submissionNote}
                          </div>
                        )}
                        {m.submittedAt && (
                          <p className="mt-0.5 text-[12px] text-gray-500">
                            Submitted {formatDate(m.submittedAt)}
                          </p>
                        )}
                      </div>
                      {m.status === "FUNDED" && (
                        <button
                          type="button"
                          onClick={() => setSubmitModalMilestone(m)}
                          className="shrink-0 rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-emerald-400"
                        >
                          Submit work
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Submit modal */}
          {submitModalMilestone && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => !submittingId && setSubmitModalMilestone(null)}
            >
              <div
                className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-sm font-semibold text-black">
                  Submit work: {submitModalMilestone.title}
                </h3>
                <p className="mt-0.5 text-[14px] text-gray-600">
                  Add a note or link for the client (optional).
                </p>
                <textarea
                  value={submitNote}
                  onChange={(e) => setSubmitNote(e.target.value)}
                  placeholder="e.g. Deliverables: [link], Summary: ..."
                  rows={4}
                  className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[14px] text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitModalMilestone(null);
                      setSubmitNote("");
                    }}
                    disabled={!!submittingId}
                    className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-[14px] font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitMilestone}
                    disabled={submittingId !== null}
                    className="flex-1 rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {submittingId ? "Submitting…" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <BackButton href="/freelancer/contracts">Back to contracts</BackButton>
        </main>
      </div>
    </div>
  );
}
