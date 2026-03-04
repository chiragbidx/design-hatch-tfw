"use client";

import Link from "next/link";
import ClientNavbar from "../../components/ClientNavbar";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";

type ExperienceLevel = "entry" | "intermediate" | "expert";

interface PostJobFormState {
  title: string;
  description: string;
  budget: string;
  experienceLevel: ExperienceLevel | "";
  skills: string;
}

export default function ClientJobPostPage() {
  const [form, setForm] = useState<PostJobFormState>({
    title: "",
    description: "",
    budget: "",
    experienceLevel: "",
    skills: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleChange =
    (field: keyof PostJobFormState) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>
        | React.ChangeEvent<HTMLSelectElement>
    ) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setError(null);
      setSuccess(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!token) {
      setError("You must be logged in to post a job.");
      return;
    }

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.budget.trim() ||
      !form.experienceLevel
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const budgetNumber = Number(form.budget);
    if (!Number.isFinite(budgetNumber) || budgetNumber <= 0) {
      setError("Please enter a valid fixed budget greater than 0.");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(
        "/api/client/jobs",
        {
          ...form,
          budget: budgetNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Job posted successfully!");
      setForm({
        title: "",
        description: "",
        budget: "",
        experienceLevel: "",
        skills: "",
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Failed to create job");
      } else {
        setError(
          error instanceof Error ? error.message : "An error occurred while posting the job. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <ClientNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-3xl rounded-full bg-emerald-500/10 blur-3xl" />

        <main className="relative z-10 mt-10 flex flex-1 flex-col gap-6">
          <section className="grid gap-8 rounded-3xl border border-emerald-200 bg-white p-6 text-sm text-gray-700 shadow-[0_30px_120px_rgba(15,118,110,0.2)] md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:p-8 lg:p-10">
            {/* left side form */}
            <section className="space-y-5">
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[14px] font-medium text-emerald-700">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]" />
                  Fixed-price projects only
                </p>
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                  Describe the work you{" "}
                  <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                    need done
                  </span>
                  .
                </h1>
                <p className="text-sm leading-relaxed text-gray-700">
                  This form is for clients on PandaWork to post{" "}
                  <span className="font-medium text-emerald-600">
                    fixed price
                  </span>{" "}
                  jobs only. You can add hourly jobs later when you connect a
                  real backend.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="block text-gray-700" htmlFor="title">
                    Job title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange("title")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2"
                    placeholder="e.g. PandaWork-style landing page for my SaaS"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-700" htmlFor="description">
                    Job description
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    value={form.description}
                    onChange={handleChange("description")}
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2"
                    placeholder="Explain the project, deliverables and any timelines. Freelancers use this to decide whether to apply."
                  />
                </div>

                <div className="grid gap-3">
                  <div className="space-y-1.5">
                    <label
                      className="block text-gray-700"
                      htmlFor="experienceLevel"
                    >
                      Experience level
                    </label>
                    <select
                      id="experienceLevel"
                      value={form.experienceLevel}
                      onChange={handleChange("experienceLevel")}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-emerald-500 focus:ring-2"
                    >
                      <option value="">Select level</option>
                      <option value="entry">Entry</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <div className="space-y-1.5">
                    <label className="block text-gray-700" htmlFor="budget">
                      Fixed budget (USD)
                    </label>
                    <input
                      id="budget"
                      type="number"
                      min={0}
                      value={form.budget}
                      onChange={handleChange("budget")}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. 1200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-gray-700">
                      Payment type
                    </label>
                    <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[14px] text-emerald-700">
                      Fixed price only. Hourly work can be enabled later when
                      you attach a real backend/payments system.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-700" htmlFor="skills">
                    Required skills (comma separated)
                  </label>
                  <input
                    id="skills"
                    type="text"
                    value={form.skills}
                    onChange={handleChange("skills")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2"
                    placeholder="e.g. Next.js, React, Tailwind CSS"
                  />
                </div>

                {error && (
                  <p className="rounded-xl border border-red-500/40 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                {success && (
                  <p className="rounded-xl border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {success}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/70"
                >
                  {submitting ? "Posting your job..." : "Post fixed-price job"}
                </button>
              </form>
            </section>

            {/* right side helper panel */}
            <aside className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-[14px] text-gray-700 shadow-sm sm:p-5">
              <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Tips for a great job post
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[14px] text-gray-600">
                    Be specific about deliverables, scope and timelines so
                    freelancers can estimate accurately.
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[14px] text-gray-600">
                    Use the skills field so the right freelancers find your job
                    in search and filters.
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[14px] text-gray-600">
                    Start with a clear fixed budget. You can negotiate scope and
                    milestones in chat later.
                  </p>
                </li>
              </ul>

              <p className="pt-1 text-[12px] text-gray-600">
                This form doesn&apos;t yet save to a database. When you&apos;re
                ready, connect it to your own API or a backend service to create
                real job records for freelancers to discover.
              </p>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
