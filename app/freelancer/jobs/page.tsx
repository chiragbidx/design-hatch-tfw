"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  type BudgetType,
  type ExperienceLevel,
  type Job,
} from "../../data/jobs";
import FreelancerNavbar from "../../components/FreelancerNavbar";
import JobCard from "../../components/JobCard";

const categories = [
  "All",
  "Web Development",
  "Design & Creative",
  "AI & Data",
] as const;

type CategoryFilter = (typeof categories)[number];

type SortOption = "newest" | "budget-high";

export default function FreelancerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [budgetType, setBudgetType] = useState<BudgetType | "all">("all");
  const [experience, setExperience] = useState<ExperienceLevel | "all">("all");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("/api/freelancer/jobs");
        setJobs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        if (category !== "All" && job.category !== category) return false;

        if (budgetType !== "all" && job.budgetType !== budgetType) {
          return false;
        }

        if (experience !== "all" && job.experienceLevel !== experience) {
          return false;
        }

        const min = minBudget ? Number(minBudget) : undefined;
        const max = maxBudget ? Number(maxBudget) : undefined;
        if (!Number.isNaN(min) && min !== undefined && job.budget < min) {
          return false;
        }
        if (!Number.isNaN(max) && max !== undefined && job.budget > max) {
          return false;
        }

        if (search.trim()) {
          const q = search.toLowerCase();
          const haystack =
            job.title.toLowerCase() + " " + job.description.toLowerCase();
          if (!haystack.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === "newest") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        if (sort === "budget-high") {
          return b.budget - a.budget;
        }
        return 0;
      });
  }, [
    jobs,
    search,
    category,
    budgetType,
    experience,
    minBudget,
    maxBudget,
    sort,
  ]);

  return (
    <div className="min-h-screen bg-white text-black">
      <FreelancerNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        {/* glow background */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-50 blur-3xl" />

        {/* content */}
        <main className="relative z-10 mt-6 flex flex-1 flex-col gap-6">
          {/* header + search */}
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600">
                Job listings
              </p>
              <h1 className="text-xl font-semibold text-black sm:text-2xl">
                Find work that matches your skills.
              </h1>
              <p className="text-sm text-gray-600">
                Browse real client jobs posted on PandaWork-style marketplace.
              </p>
            </div>

            <div className="w-full max-w-xs text-sm sm:max-w-sm">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or description..."
                  className="w-full rounded-full border border-gray-200 bg-white/80 px-3 py-2 pl-8 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                />
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[14px] text-black0">
                  🔍
                </span>
              </div>
            </div>
          </section>

          {/* filters */}
          <section className="flex flex-col gap-3 rounded-3xl border border-gray-200/90 bg-white p-4 text-[14px] text-gray-700 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-600">Category:</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-3 py-1 transition ${
                      category === cat
                        ? "bg-emerald-500 text-white shadow-[0_10px_35px_rgba(16,185,129,0.6)]"
                        : "border border-gray-300/90 bg-white/70 text-gray-700 hover:border-slate-500"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Budget type:</span>
                <select
                  value={budgetType}
                  onChange={(e) =>
                    setBudgetType(e.target.value as BudgetType | "all")
                  }
                  className="rounded-full border border-gray-200 bg-white/80 px-2.5 py-1 text-[14px] text-black outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
                >
                  <option value="all">Any</option>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600">Experience:</span>
                <select
                  value={experience}
                  onChange={(e) =>
                    setExperience(e.target.value as ExperienceLevel | "all")
                  }
                  className="rounded-full border border-gray-200 bg-white/80 px-2.5 py-1 text-[14px] text-black outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
                >
                  <option value="all">Any</option>
                  <option value="entry">Entry</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-600">Budget:</span>
                <input
                  type="number"
                  min={0}
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  placeholder="Min"
                  className="w-20 rounded-full border border-gray-200 bg-white/80 px-2 py-1 text-[14px] text-black outline-none placeholder:text-black0 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
                />
                <span className="text-black0">–</span>
                <input
                  type="number"
                  min={0}
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="Max"
                  className="w-20 rounded-full border border-gray-200 bg-white/80 px-2 py-1 text-[14px] text-black outline-none placeholder:text-black0 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span className="text-gray-600">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="rounded-full border border-gray-200 bg-white/80 px-2.5 py-1 text-[14px] text-black outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
                >
                  <option value="newest">Newest</option>
                  <option value="budget-high">Budget (high → low)</option>
                </select>
              </div>
            </div>
          </section>

          {/* job list */}
          <section className="space-y-3 rounded-3xl border border-gray-200/90 bg-white p-4 text-sm text-gray-700 sm:p-5">
            {filteredJobs.length === 0 ? (
              <div className="flex flex-col items-start justify-between gap-2 rounded-2xl border border-dashed border-gray-300/80 bg-white/60 px-3 py-3 text-[14px] text-gray-600 sm:flex-row sm:items-center">
                <p>No jobs match these filters. Try widening your search.</p>
                <button
                  className="mt-1 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-500/60 sm:mt-0"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setBudgetType("all");
                    setExperience("all");
                    setMinBudget("");
                    setMaxBudget("");
                    setSort("newest");
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <ul className="grid gap-4 sm:gap-5">
                {filteredJobs.map((job) => (
                  <li key={job.id}>
                    <JobCard job={job} variant="default" />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
