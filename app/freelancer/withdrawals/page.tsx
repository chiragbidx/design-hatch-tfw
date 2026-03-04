"use client";

import Link from "next/link";
import FreelancerNavbar from "../../components/FreelancerNavbar";
import BackButton from "../../components/BackButton";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

interface Balance {
  availableBalance: number;
  totalReleased: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
}

interface WithdrawalRow {
  id: number;
  amount: number;
  status: string;
  method: string | null;
  note: string | null;
  processedAt: string | null;
  createdAt: string;
}

const MIN_WITHDRAWAL = 10;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusStyle(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
    case "PENDING":
      return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
    case "PROCESSING":
      return "bg-blue-50 text-blue-800 ring-1 ring-blue-200";
    case "FAILED":
      return "bg-red-50 text-red-800 ring-1 ring-red-200";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function FreelancerWithdrawalsPage() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [balanceRes, listRes] = await Promise.all([
        axios.get("/api/freelancer/balance", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/freelancer/withdrawals", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setBalance(balanceRes.data);
      setWithdrawals(Array.isArray(listRes.data) ? listRes.data : []);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFieldError(null);
    const num = parseInt(amount, 10);
    if (Number.isNaN(num) || num < MIN_WITHDRAWAL) {
      setFieldError(`Minimum withdrawal is $${MIN_WITHDRAWAL}`);
      return;
    }
    if (balance && num > balance.availableBalance) {
      setFieldError(
        `You only have $${balance.availableBalance.toLocaleString()} available to withdraw.`,
      );
      return;
    }
    if (method === "bank_transfer") {
      if (
        !bankName.trim() ||
        !accountName.trim() ||
        !accountNumber.trim() ||
        !ifsc.trim()
      ) {
        setFieldError("Please fill in all bank details for a bank transfer.");
        return;
      }
    }
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await axios.post(
        "/api/freelancer/withdrawals",
        {
          amount: num,
          method,
          note: note.trim() || undefined,
          bankDetails:
            method === "bank_transfer"
              ? {
                  bankName,
                  accountName,
                  accountNumber,
                  ifsc,
                }
              : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSuccess(
        `Withdrawal request for $${num.toLocaleString()} submitted. It will be processed shortly.`,
      );
      setAmount("");
      setNote("");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to request withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <FreelancerNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-6 flex flex-1 flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600">
                Earnings & payouts
              </p>
              <h1 className="mt-1 text-xl font-semibold text-black sm:text-2xl">
                Withdrawals
              </h1>
              <p className="mt-0.5 text-sm text-gray-600">
                Request a payout from your released earnings. View history
                below.
              </p>
            </div>
            <Link
              href="/freelancer/dashboard"
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-emerald-500 hover:bg-gray-50"
            >
              ← Dashboard
            </Link>
          </header>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              {success}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-600">Loading…</p>
          ) : (
            <>
              {/* Balance summary */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold text-black">
                  Available balance
                </h2>
                <p className="mt-1 text-2xl font-semibold text-emerald-600">
                  {balance != null
                    ? `$${balance.availableBalance.toLocaleString()}`
                    : "—"}
                </p>
                {balance != null && (
                  <p className="mt-1 text-[14px] text-gray-600">
                    Total released: ${balance.totalReleased.toLocaleString()}
                    {" · "}
                    Total withdrawn: ${balance.totalWithdrawn.toLocaleString()}
                    {balance.pendingWithdrawals > 0 &&
                      ` · $${balance.pendingWithdrawals.toLocaleString()} pending`}
                  </p>
                )}
              </section>

              {/* Request withdrawal */}
              <section className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-black">
                  Request withdrawal
                </h2>
                <p className="mt-0.5 text-[14px] text-gray-600">
                  Minimum ${MIN_WITHDRAWAL}. Payouts are processed manually;
                  allow 1–5 business days. Make sure your payout details are
                  correct before submitting.
                </p>
                <form
                  onSubmit={handleSubmit}
                  className="mt-4 space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <label
                        htmlFor="amount"
                        className="block text-[14px] font-medium text-gray-700"
                      >
                        Amount ($)
                      </label>
                      <input
                        id="amount"
                        type="number"
                        min={MIN_WITHDRAWAL}
                        max={balance?.availableBalance ?? undefined}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label
                        htmlFor="method"
                        className="block text-[14px] font-medium text-gray-700"
                      >
                        Method
                      </label>
                      <select
                        id="method"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="bank_transfer">Bank transfer</option>
                        <option value="paypal">PayPal</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-1">
                      <label
                        htmlFor="note"
                        className="block text-[14px] font-medium text-gray-700"
                      >
                        Note (optional)
                      </label>
                      <input
                        id="note"
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Account details"
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  {method === "bank_transfer" && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-[14px] font-medium text-gray-700">
                          Bank name
                        </label>
                        <input
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. HDFC Bank"
                          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[14px] font-medium text-gray-700">
                          Account holder name
                        </label>
                        <input
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="As per bank records"
                          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[14px] font-medium text-gray-700">
                          Account number
                        </label>
                        <input
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="XXXXXXXXXXXX"
                          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[14px] font-medium text-gray-700">
                          IFSC code
                        </label>
                        <input
                          value={ifsc}
                          onChange={(e) => setIfsc(e.target.value)}
                          placeholder="IFSC0001234"
                          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                  )}

                  {fieldError && (
                    <p className="text-[14px] text-red-600">{fieldError}</p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        !amount ||
                        (balance != null &&
                          balance.availableBalance < MIN_WITHDRAWAL)
                      }
                      className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-60"
                    >
                      {submitting ? "Submitting…" : "Request withdrawal"}
                    </button>
                  </div>
                </form>
              </section>

              {/* Withdrawal history */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold text-black">
                  Withdrawal history
                </h2>
                <p className="mt-0.5 text-[14px] text-gray-600">
                  All your payout requests and their status.
                </p>
                {withdrawals.length === 0 ? (
                  <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center text-[14px] text-gray-600">
                    No withdrawals yet. Request a payout above when you have
                    available balance.
                  </div>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[400px] text-left text-[14px]">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                          <th className="pb-2 font-semibold">Date</th>
                          <th className="pb-2 font-semibold">Amount</th>
                          <th className="pb-2 font-semibold">Method</th>
                          <th className="pb-2 font-semibold">Status</th>
                          <th className="pb-2 font-semibold">Processed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawals.map((w) => (
                          <tr key={w.id} className="border-b border-gray-100">
                            <td className="py-3 text-gray-700">
                              {formatDate(w.createdAt)}
                            </td>
                            <td className="py-3 font-medium text-black">
                              ${w.amount.toLocaleString()}
                            </td>
                            <td className="py-3 text-gray-600">
                              {w.method || "—"}
                            </td>
                            <td className="py-3">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-medium ${statusStyle(w.status)}`}
                              >
                                {w.status}
                              </span>
                            </td>
                            <td className="py-3 text-gray-600">
                              {w.processedAt ? formatDate(w.processedAt) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          <BackButton href="/freelancer/dashboard">
            Back to dashboard
          </BackButton>
        </main>
      </div>
    </div>
  );
}
