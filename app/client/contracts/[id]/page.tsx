"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ClientNavbar from "../../../components/ClientNavbar";
import BackButton from "../../../components/BackButton";
import AlertModal from "../../../components/AlertModal";
import { useCallback, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe(
  process.env.STRIPE_PUBLISHABLE_KEY || ""
);

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
  job: { id: number; title: string; description: string; budget: number; status: string };
  freelancer: {
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

function FundMilestoneForm({
  clientSecret,
  paymentIntentId,
  milestoneTitle,
  amount,
  token,
  onSuccess,
  onClose,
}: {
  clientSecret: string;
  paymentIntentId: string;
  milestoneTitle: string;
  amount: number;
  token: string | null;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !token) return;
    const card = elements.getElement(CardElement);
    if (!card) return;
    setErr(null);
    setPaying(true);
    try {
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });
      if (error) {
        setErr(error.message || "Payment failed");
        setPaying(false);
        return;
      }
      await axios.post(
        "/api/client/milestones/fund/confirm",
        { paymentIntentId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onSuccess();
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setErr(e.response?.data?.error || "Failed to confirm");
      } else {
        setErr(e instanceof Error ? e.message : "Something went wrong");
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm font-medium text-black">
        {milestoneTitle} · ${amount}
      </p>
      <div className="rounded-xl border border-gray-300 bg-white px-4 py-3">
        <CardElement
          options={{
            style: {
              base: { fontSize: "14px", color: "#111" },
              invalid: { color: "#b91c1c" },
            },
          }}
        />
      </div>
      {err && (
        <p className="text-[14px] text-red-600" role="alert">
          {err}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={paying}
          className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-[14px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || paying}
          className="flex-1 rounded-full bg-emerald-500 px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          {paying ? "Processing…" : "Pay now"}
        </button>
      </div>
    </form>
  );
}

export default function ClientContractDetailPage() {
  const params = useParams<{ id: string }>();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fundingId, setFundingId] = useState<number | null>(null);
  const [releasingId, setReleasingId] = useState<number | null>(null);
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [fundModal, setFundModal] = useState<{
    milestoneId: number;
    title: string;
    amount: number;
  } | null>(null);
  const [fundPaymentIntent, setFundPaymentIntent] = useState<{
    clientSecret: string;
    paymentIntentId: string;
  } | null>(null);
  const [closingJob, setClosingJob] = useState(false);
  const [showCloseJobConfirm, setShowCloseJobConfirm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchContract = useCallback(async () => {
    if (!params.id || !token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/client/contracts/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContract(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setContract(null);
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
      setContract(null);
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const handleFund = async (milestoneId: number) => {
    if (!token || !contract) return;
    setActionError(null);
    setFundingId(milestoneId);
    try {
      const res = await axios.post(
        "/api/client/milestones/fund",
        { milestoneId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data;
      const milestone = contract.milestones.find((m) => m.id === milestoneId);
      if (!milestone) return;
      setFundModal({
        milestoneId,
        title: milestone.title,
        amount: milestone.amount,
      });
      setFundPaymentIntent({
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setActionError(err.response?.data?.error || "Failed to fund");
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to fund");
      }
    } finally {
      setFundingId(null);
    }
  };

  const handleFundSuccess = useCallback(() => {
    setFundModal(null);
    setFundPaymentIntent(null);
    setSuccess("Milestone funded.");
    fetchContract();
  }, [fetchContract]);

  const handleFundClose = useCallback(() => {
    setFundModal(null);
    setFundPaymentIntent(null);
  }, []);

  const handleRelease = async (milestoneId: number) => {
    if (!token) return;
    setActionError(null);
    setReleasingId(milestoneId);
    try {
      await axios.post(
        "/api/client/milestones/release",
        { milestoneId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Payment released.");
      await fetchContract();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setActionError(err.response?.data?.error || "Failed to release");
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to release");
      }
    } finally {
      setReleasingId(null);
    }
  };

  const handleCloseJobClick = () => {
    setShowCloseJobConfirm(true);
  };

  const performJobClose = async () => {
    if (!token || !contract) return false;
    setActionError(null);
    setClosingJob(true);
    try {
      await axios.patch(
        `/api/client/jobs/${contract.job.id}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Job closed successfully.");
      await fetchContract();
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setActionError(err.response?.data?.error || "Failed to close job");
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to close job");
      }
      return false;
    } finally {
      setClosingJob(false);
    }
  };

  const handleCloseJobConfirm = () => {
    // After confirming intent to close, show review form
    setShowCloseJobConfirm(false);
    setShowReviewModal(true);
  };

  const handleCloseWithoutReview = async () => {
    const closed = await performJobClose();
    if (closed) {
      setShowReviewModal(false);
    }
  };

  const handleSubmitReviewAndClose = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!token || !contract) return;
    setActionError(null);
    setSubmittingReview(true);
    try {
      await axios.post(
        "/api/reviews",
        {
          contractId: contract.id,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const closed = await performJobClose();
      if (closed) {
        setShowReviewModal(false);
        setReviewRating(5);
        setReviewComment("");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setActionError(err.response?.data?.error || "Failed to submit review");
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to submit review");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !params.id) return;
    const amount = parseInt(newAmount, 10);
    if (!newTitle.trim() || Number.isNaN(amount) || amount < 1) {
      setActionError("Title and a valid amount are required.");
      return;
    }
    setActionError(null);
    setAddingMilestone(true);
    try {
      await axios.post(
        `/api/client/contracts/${params.id}/milestones`,
        { title: newTitle.trim(), amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Milestone added.");
      setNewTitle("");
      setNewAmount("");
      await fetchContract();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setActionError(err.response?.data?.error || "Failed to add");
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to add");
      }
    } finally {
      setAddingMilestone(false);
    }
  };

  const freelancerName = contract
    ? `${contract.freelancer.firstName} ${contract.freelancer.lastName}`.trim() ||
      contract.freelancer.email
    : "";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <p className="text-sm text-gray-600">Loading contract…</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-white text-black">
        <ClientNavbar />
        <div className="mx-auto flex min-h-screen flex-col items-center justify-center gap-4 px-6">
          <p className="text-sm text-gray-600">Contract not found.</p>
          <BackButton href="/client/contracts">Back to contracts</BackButton>
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
          {/* Contract header */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h1 className="text-lg font-semibold text-black">{contract.job.title}</h1>
            <p className="mt-0.5 text-[14px] text-gray-600">
              With {freelancerName} · Started {formatDate(contract.createdAt)} ·{" "}
              {contract.status}
            </p>
            {contract.job.description && (
              <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-[14px] text-gray-600">
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

          {/* Add milestone — only when job is open */}
          {contract.job.status !== "CLOSED" && (
            <section className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-black">Add milestone</h2>
              <p className="mt-0.5 text-[14px] text-gray-600">
                Define a deliverable and amount. After adding, fund it to put funds in
                escrow. When the freelancer submits work, you can approve and release.
              </p>
              <form onSubmit={handleAddMilestone} className="mt-4 flex flex-wrap gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Design mockups"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[14px] text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-w-[180px]"
                />
                <input
                  type="number"
                  min={1}
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="Amount ($)"
                  className="w-24 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[14px] text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={addingMilestone}
                  className="rounded-full bg-emerald-500 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {addingMilestone ? "Adding…" : "Add milestone"}
                </button>
              </form>
            </section>
          )}

          {/* Milestones list */}
          <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold text-black">Milestones</h2>
            <p className="mt-0.5 text-[14px] text-gray-600">
              Pending → Fund → Freelancer submits → You approve & release
            </p>

            {contract.milestones.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center text-[14px] text-gray-600">
                {contract.job.status === "CLOSED"
                  ? "No milestones."
                  : "No milestones yet. Add one above."}
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
                        {m.status === "SUBMITTED" && m.submissionNote && (
                          <div className="mt-2 rounded-xl bg-white p-2 text-[14px] text-gray-700">
                            <span className="font-medium text-gray-500">
                              Submission note:
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
                      <div className="flex shrink-0 gap-2">
                        {m.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleFund(m.id)}
                            disabled={fundingId === m.id}
                            className="rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
                          >
                            {fundingId === m.id ? "Funding…" : "Fund milestone"}
                          </button>
                        )}
                        {m.status === "SUBMITTED" && (
                          <button
                            type="button"
                            onClick={() => handleRelease(m.id)}
                            disabled={releasingId === m.id}
                            className="rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
                          >
                            {releasingId === m.id
                              ? "Releasing…"
                              : "Approve & release"}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Close job — only when job is open */}
          <section className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-black">Close job</h2>
            {contract.job.status === "CLOSED" ? (
              <p className="mt-0.5 text-[14px] text-gray-600">
                This job is closed.
              </p>
            ) : (
              <>
                <p className="mt-0.5 text-[14px] text-gray-600">
                  You can close this job only after all milestone payments have been
                  released.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleCloseJobClick}
                    disabled={closingJob}
                    className="rounded-full border border-gray-300 bg-white px-4 py-2 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    {closingJob ? "Closing…" : "Close job"}
                  </button>
                </div>
              </>
            )}
          </section>

          <BackButton href="/client/contracts">Back to contracts</BackButton>
        </main>

        <AlertModal
          open={showCloseJobConfirm}
          onClose={() => setShowCloseJobConfirm(false)}
          title="Close job"
          message="Close this job? You can only close it after all milestone payments have been released."
          onConfirm={handleCloseJobConfirm}
          confirmLabel="Close job"
          cancelLabel="Cancel"
        />

        {/* Review modal shown when closing job */}
        {showReviewModal && contract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:p-5">
              <h3 className="text-sm font-semibold text-black">
                Leave a review for {freelancerName}
              </h3>
              <p className="mt-1 text-[14px] text-gray-600">
                Share quick feedback about your experience. This will appear on
                the freelancer&apos;s profile after closing the job.
              </p>
              <form
                onSubmit={handleSubmitReviewAndClose}
                className="mt-4 space-y-3 text-[14px]"
              >
                <div className="space-y-1.5">
                  <label className="block font-medium text-gray-800">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReviewRating(value)}
                        className={`h-8 w-8 rounded-full border text-[14px] font-semibold ${
                          reviewRating === value
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-300 bg-white text-gray-700"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                    <span className="text-[12px] text-gray-500">
                      {reviewRating} / 5
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-gray-800">
                    Comments (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="What went well? Anything the freelancer could improve?"
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCloseWithoutReview}
                    disabled={submittingReview || closingJob}
                    className="rounded-full border border-gray-300 px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    Skip review &amp; close
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || closingJob}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {submittingReview || closingJob
                      ? "Saving…"
                      : "Submit review and close"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* In-app payment modal (no redirect to Stripe) */}
        {fundModal && fundPaymentIntent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4">
            <div className="my-auto w-full max-w-md shrink-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:p-5">
              <h3 className="text-sm font-semibold text-black">
                Pay for milestone
              </h3>
              <p className="mt-1 text-[14px] text-gray-600">
                Enter your card details below. You stay on this page.
              </p>
              <div className="mt-4">
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: fundPaymentIntent.clientSecret,
                    appearance: { theme: "stripe" },
                  }}
                >
                  <FundMilestoneForm
                    clientSecret={fundPaymentIntent.clientSecret}
                    paymentIntentId={fundPaymentIntent.paymentIntentId}
                    milestoneTitle={fundModal.title}
                    amount={fundModal.amount}
                    token={token}
                    onSuccess={handleFundSuccess}
                    onClose={handleFundClose}
                  />
                </Elements>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
