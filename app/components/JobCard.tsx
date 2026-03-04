"use client";

import Link from "next/link";
import type { Job } from "@/app/data/jobs";
import { formatJobDateLabel } from "@/app/data/jobs";

type JobCardVariant = "default" | "saved";

interface JobCardProps {
  job: Job;
  variant?: JobCardVariant;
  onUnsave?: (jobId: string) => void;
}

export default function JobCard({
  job,
  variant = "default",
  onUnsave,
}: JobCardProps) {
  const budgetLabel =
    job.budgetType === "fixed"
      ? `$${job.budget} fixed`
      : `$${job.budget}/hr`;

  return (
    <article
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
      aria-labelledby={`job-title-${job.id}`}
    >
      {/* Top: Title + Category */}
      <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 id={`job-title-${job.id}`} className="min-w-0 flex-1">
            <Link
              href={`/freelancer/jobs/${job.id}`}
              className="block text-base font-semibold leading-tight text-black hover:text-emerald-600 sm:text-[15px]"
            >
              {job.title}
            </Link>
          </h2>
          {/* <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[12px] font-medium uppercase tracking-wide text-emerald-800">
            {'job.category'}
          </span> */}
        </div>
        {/* Meta: Budget · Experience · Posted */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[14px] text-gray-500">
          <span className="font-medium text-emerald-700">{budgetLabel}</span>
          <span aria-hidden className="text-gray-300">
            ·
          </span>
          <span className="capitalize">{job.experienceLevel} level</span>
          <span aria-hidden className="text-gray-300">
            ·
          </span>
          <span>Posted {formatJobDateLabel(job.createdAt)}</span>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5">
        <p className="line-clamp-2 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-600">
          {job.description}
        </p>
      </div>

      {/* Client block — clearly separated */}
      <div className="border-t border-gray-100 bg-gray-50/30 px-4 py-2.5 sm:px-5">
        <p className="text-[12px] font-medium uppercase tracking-wider text-gray-400">
          Client
        </p>
        <p className="mt-0.5 text-[14px] font-medium text-gray-800">
          {job.client.name}
        </p>
        <p className="text-[14px] text-gray-500">
          {job.client.location} · {job.client.jobsPosted} jobs posted ·{" "}
          {job.client.hireRate}% hire rate
        </p>
      </div>

      {/* Skills */}
      <div className="border-t border-gray-100 px-4 py-2.5 sm:px-5">
        <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wider text-gray-400">
          Required skills
        </p>
        <div className="flex flex-wrap gap-1.5">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-[14px] text-gray-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 bg-white px-4 py-3 sm:px-5">
        {variant === "saved" && onUnsave && (
          <button
            type="button"
            onClick={() => onUnsave(job.id)}
            className="rounded-full border border-gray-300 px-3 py-2 text-[14px] font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Unsave
          </button>
        )}
        {variant === "saved" ? (
          <Link
            href={`/freelancer/jobs/${job.id}/apply`}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(16,185,129,0.4)] transition hover:bg-emerald-600"
          >
            Apply now
          </Link>
        ) : (
          <Link
            href={`/freelancer/jobs/${job.id}`}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(16,185,129,0.4)] transition hover:bg-emerald-600"
          >
            View & apply
          </Link>
        )}
      </div>
    </article>
  );
}
