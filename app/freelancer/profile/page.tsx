"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import FreelancerNavbar from "../../components/FreelancerNavbar";
import axios from "axios";

interface PortfolioItem {
  title: string;
  role: string;
  result: string;
}

interface ExperienceItem {
  title: string;
  org: string;
  period: string;
  details: string;
}

interface RatePreferences {
  hourlyRate: string;
  availability: string;
}

interface ProfileStats {
  experience: string;
  jobs: string;
  success: string;
}

interface userProfile {
  id: number;
  email: string;
  username: string;
  firstName: string;
  role: string;
}

interface ReviewItem {
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

export default function FreelancerProfilePage() {
  // Description about self
  const [aboutDescription, setAboutDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [aboutFormText, setAboutFormText] = useState("");
  const [aboutError, setAboutError] = useState<string | null>(null);

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [skillsFormText, setSkillsFormText] = useState("");
  const [skillsError, setSkillsError] = useState<string | null>(null);

  // Experience
  const [experienceItems, setExperienceItems] = useState<ExperienceItem[]>([]);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [experienceForm, setExperienceForm] = useState<ExperienceItem>({
    title: "",
    org: "",
    period: "",
    details: "",
  });
  const [experienceError, setExperienceError] = useState<string | null>(null);

  // Rate & preferences
  const [ratePreferences, setRatePreferences] = useState<RatePreferences>({
    hourlyRate: "",
    availability: "",
  });

  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [rateForm, setRateForm] = useState<RatePreferences>({
    hourlyRate: "",
    availability: "",
  });
  const [rateError, setRateError] = useState<string | null>(null);

  // Summary stats (experience, jobs, success)
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    experience: "",
    jobs: "",
    success: "",
  });
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsForm, setStatsForm] = useState<ProfileStats>({
    experience: "",
    jobs: "",
    success: "",
  });
  const [statsError, setStatsError] = useState<string | null>(null);

  // Portfolio
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [portfolioForm, setPortfolioForm] = useState<PortfolioItem>({
    title: "",
    role: "",
    result: "",
  });
  const [user, setUser] = useState<userProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

      try {
        const res = await axios.get("/api/freelancer/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;
          const { user, profile, avatarUrl ,reviews: reviewsData, averageRating: avgRating, reviewCount: totalReviews} = data;

        if (profile) {
          setAboutDescription(profile.bio || "");
          setAvatarUrl(avatarUrl || null);

          if (Array.isArray(profile.skills)) {
            setSkills(profile.skills.map((s: any) => s.name || s));
          }

          if (Array.isArray(profile.experience)) {
            setExperienceItems(profile.experience);
          }

          if (Array.isArray(profile.portfolio)) {
            setPortfolioItems(profile.portfolio);
          }

          setRatePreferences({
            hourlyRate: profile.hourlyRate
              ? `$${profile.hourlyRate} / hour`
              : "",
            availability: profile.availability || "",
          });

          setProfileStats({
            experience: profile.experienceStat || "",
            jobs: profile.completedJobs || "",
            success: profile.jobSuccess || "",
          });
        }

        if (Array.isArray(reviewsData)) {
          setReviews(reviewsData);
        } else {
          setReviews([]);
        }

        setAverageRating(
          typeof avgRating === "number" ? avgRating : null
        );
        setReviewCount(typeof totalReviews === "number" ? totalReviews : 0);

          setUser(user);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

  // Fetch profile data
  useEffect(() => {
  
    fetchProfile();
  }, []);

  // Helper to save data to API
  const saveProfileSection = async (section: string, data: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to save changes.");
      return false;
    }

    try {
      await axios.put(
        "/api/freelancer/profile",
        { section, data },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
     fetchProfile();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post("/api/upload", formData);

      const { url } = uploadRes.data;

      // Save to profile
      const success = await saveProfileSection("avatar", { avatarUrl: url });

      if (success) {
        setAvatarUrl(url);
        toast.success("Profile image updated", { id: toastId });
      } else {
        throw new Error("Failed to save to profile");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAboutSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!aboutFormText.trim()) {
      setAboutError("Please add a short description about yourself.");
      return;
    }

    const success = await saveProfileSection("about", {
      description: aboutFormText.trim(),
    });

    if (success) {
      setAboutDescription(aboutFormText.trim());
      setIsAboutModalOpen(false);
      setAboutError(null);
      toast.success("Description updated");
    } else {
      setAboutError("Failed to save description");
    }
  };

  const handleSkillsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!skillsFormText.trim()) {
      setSkillsError("Please add at least one skill.");
      return;
    }

    const parsed = skillsFormText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (parsed.length === 0) {
      setSkillsError("Please add at least one valid skill.");
      return;
    }

    const success = await saveProfileSection("skills", { skills: parsed });

    if (success) {
      setSkills(parsed);
      setIsSkillsModalOpen(false);
      setSkillsError(null);
      toast.success("Skills updated");
    } else {
      setSkillsError("Failed to save skills");
    }
  };

  const handleExperienceChange =
    (field: keyof ExperienceItem) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setExperienceForm((prev) => ({ ...prev, [field]: event.target.value }));
      setExperienceError(null);
    };

  const handleExperienceSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!experienceForm.title.trim() || !experienceForm.org.trim()) {
      setExperienceError("Please add at least a title and organization.");
      return;
    }

    const newItems = [...experienceItems, experienceForm];
    const success = await saveProfileSection("experience", { items: newItems });

    if (success) {
      setExperienceItems(newItems);
      setExperienceForm({ title: "", org: "", period: "", details: "" });
      setExperienceError(null);
      setIsExperienceModalOpen(false);
      toast.success("Experience added");
    } else {
      setExperienceError("Failed to save experience");
    }
  };

  const handleRateChange =
    (field: keyof RatePreferences) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setRateForm((prev) => ({ ...prev, [field]: event.target.value }));
      setRateError(null);
    };

  const handleRateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!rateForm.hourlyRate.trim()) {
      setRateError("Please set your hourly rate.");
      return;
    }

    const success = await saveProfileSection("rate", rateForm);

    if (success) {
      setRatePreferences(rateForm);
      setIsRateModalOpen(false);
      setRateError(null);
      toast.success("Rate updated");
    } else {
      setRateError("Failed to save rate");
    }
  };

  const handleStatsChange =
    (field: keyof ProfileStats) => (event: ChangeEvent<HTMLInputElement>) => {
      setStatsForm((prev) => ({ ...prev, [field]: event.target.value }));
      setStatsError(null);
    };

  const handleStatsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!statsForm.experience.trim()) {
      setStatsError("Please add at least your years of experience.");
      return;
    }

    const success = await saveProfileSection("stats", statsForm);

    if (success) {
      setProfileStats(statsForm);
      setIsStatsModalOpen(false);
      setStatsError(null);
      toast.success("Stats updated");
    } else {
      setStatsError("Failed to save stats");
    }
  };

  const handlePortfolioChange =
    (field: keyof PortfolioItem) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPortfolioForm((prev) => ({ ...prev, [field]: event.target.value }));
      setPortfolioError(null);
    };

  const handlePortfolioSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!portfolioForm.title.trim() || !portfolioForm.role.trim()) {
      setPortfolioError("Please add at least a title and role.");
      return;
    }

    const newItems = [...portfolioItems, portfolioForm];
    const success = await saveProfileSection("portfolio", { items: newItems });

    if (success) {
      setPortfolioItems(newItems);
      setPortfolioForm({ title: "", role: "", result: "" });
      setPortfolioError(null);
      setIsPortfolioModalOpen(false);
      toast.success("Portfolio item added");
    } else {
      setPortfolioError("Failed to save portfolio");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Toaster position="top-center" />
      <FreelancerNavbar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        {/* glow background */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-50 blur-3xl" />

        {/* main */}
        <main className="relative z-10 mt-6 flex flex-1 flex-col gap-8">
          {/* summary + hire CTA */}
          <section className="grid gap-6 rounded-3xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:p-7">
            {/* profile summary */}
            <div className="flex gap-4">
              <div className="relative group">
                <div className="mt-0.5 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-lg font-semibold text-emerald-700 overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "AS"
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-3xl cursor-pointer transition-opacity">
                  <span className="text-[8px] text-white font-medium">
                    {isUploading ? "..." : "Edit"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base font-semibold text-black sm:text-lg">
                    {user?.username}
                  </h1>
                  {averageRating != null && reviewCount > 0 && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[12px] font-medium text-emerald-700">
                      Top Rated · {averageRating.toFixed(1)} ★
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-gray-700">
                  Full‑stack developer · Next.js, TypeScript, Tailwind · Based
                  in India
                </p>
                {aboutDescription ? (
                  <p className="text-[14px] leading-relaxed text-gray-600">
                    {aboutDescription}
                  </p>
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-2 text-[14px] text-black0">
                    <p>
                      No description yet. Add a short summary about your
                      experience so clients understand your strengths.
                    </p>
                    <button
                      className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-500/60"
                      onClick={() => setIsAboutModalOpen(true)}
                    >
                      Add description
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  {profileStats.experience ||
                  profileStats.jobs ||
                  profileStats.success ? (
                    <>
                      {profileStats.experience && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 shadow-sm text-gray-700">
                          {profileStats.experience}
                        </span>
                      )}
                      {profileStats.jobs && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 shadow-sm text-gray-700">
                          {profileStats.jobs}
                        </span>
                      )}
                      {profileStats.success && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 shadow-sm text-gray-700">
                          {profileStats.success}
                        </span>
                      )}
                      <button
                        className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 shadow-sm text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-500/60"
                        onClick={() => {
                          setStatsForm(profileStats);
                          setIsStatsModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-black0">
                        No stats yet. Add your experience; completed jobs and
                        success rate will update from your work history.
                      </span>
                      <button
                        className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-500/60"
                        onClick={() => {
                          setStatsForm(profileStats);
                          setIsStatsModalOpen(true);
                        }}
                      >
                        Add stats
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* skills, experience, portfolio, reviews */}
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)]">
            {/* left: skills, experience, portfolio */}
            <div className="space-y-6">
              {/* skills */}
              <div className="space-y-3 rounded-3xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Skills &amp; expertise
                  </h2>
                  <button
                    className="text-[14px] text-emerald-600 hover:text-emerald-700"
                    onClick={() => {
                      setSkillsFormText(skills.join(", "));
                      setIsSkillsModalOpen(true);
                    }}
                  >
                    {skills.length ? "Edit skills" : "Add skills"}
                  </button>
                </div>
                {skills.length === 0 ? (
                  <div className="flex flex-col items-start justify-between gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/60 px-3 py-3 text-[14px] text-gray-600 sm:flex-row sm:items-center">
                    <p>
                      No skills added yet. Add your main skills so clients can
                      filter you.
                    </p>
                    <button
                      className="mt-1 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-500/60 sm:mt-0"
                      onClick={() => {
                        setSkillsFormText(skills.join(", "));
                        setIsSkillsModalOpen(true);
                      }}
                    >
                      Add skills
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-gray-100 px-2.5 py-0.5 shadow-sm text-[14px] text-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* experience */}
              <div className="space-y-3 rounded-3xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Experience
                  </h2>
                  <button
                    className="text-[14px] text-emerald-600 hover:text-emerald-700"
                    onClick={() => setIsExperienceModalOpen(true)}
                  >
                    Add experience
                  </button>
                </div>
                {experienceItems.length === 0 ? (
                  <div className="flex flex-col items-start justify-between gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/60 px-3 py-3 text-[14px] text-gray-600 sm:flex-row sm:items-center">
                    <p>
                      No experience added yet. Add roles you&apos;ve worked in.
                    </p>
                    <button
                      className="mt-1 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-500/60 sm:mt-0"
                      onClick={() => setIsExperienceModalOpen(true)}
                    >
                      Add role
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {experienceItems.map((item,index) => (
                       <li key={`${item.title}-${item.org}-${index}`} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[14px] font-semibold text-black">
                            {item.title}
                          </p>
                          {item.period && (
                            <p className="text-[14px] text-black0">
                              {item.period}
                            </p>
                          )}
                        </div>
                        <p className="text-[14px] text-gray-600">{item.org}</p>
                        {item.details && (
                          <p className="text-[14px] leading-relaxed text-gray-600">
                            {item.details}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* portfolio */}
              <div className="space-y-3 rounded-3xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Portfolio
                  </h2>
                  <button
                    className="text-[14px] text-emerald-600 hover:text-emerald-700"
                    onClick={() => setIsPortfolioModalOpen(true)}
                  >
                    Add portfolio item
                  </button>
                </div>
                {portfolioItems.length === 0 ? (
                  <div className="flex flex-col items-start justify-between gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/60 px-3 py-3 text-[14px] text-gray-600 sm:flex-row sm:items-center">
                    <p>
                      No portfolio items yet. Add your first project to help
                      clients decide.
                    </p>
                    <button
                      className="mt-1 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-500/60 sm:mt-0"
                      onClick={() => setIsPortfolioModalOpen(true)}
                    >
                      Add project
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {portfolioItems.map((project,index) => (
                      <div
                        key={`${project.title}-${index}`}
                        className="space-y-1.5 rounded-2xl border border-gray-200/80 bg-white/70 p-3"
                      >
                        <p className="text-[14px] font-semibold text-black">
                          {project.title}
                        </p>
                        <p className="text-[14px] text-gray-600">
                          {project.role}
                        </p>
                        {project.result && (
                          <p className="text-[14px] text-gray-600">
                            {project.result}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* right: rate, reviews, quick info */}
            <div className="space-y-6">
              {/* rate + quick info */}
              <div className="space-y-3 rounded-3xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Rate &amp; preferences
                  </h2>
                  <button
                    className="text-[14px] text-emerald-600 hover:text-emerald-700"
                    onClick={() => {
                      setRateForm(ratePreferences);
                      setIsRateModalOpen(true);
                    }}
                  >
                    {ratePreferences.hourlyRate ? "Edit rate" : "Set rate"}
                  </button>
                </div>
                {ratePreferences.hourlyRate ? (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-black">
                        {ratePreferences.hourlyRate}
                      </p>
                      {ratePreferences.availability && (
                        <p className="text-[14px] text-gray-600">
                          {ratePreferences.availability}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-start justify-between gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/60 px-3 py-3 text-[14px] text-gray-600 sm:flex-row sm:items-center">
                    <p>
                      No rate set yet. Add your hourly rate and preferences.
                    </p>
                    <button
                      className="mt-1 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-500/60 sm:mt-0"
                      onClick={() => setIsRateModalOpen(true)}
                    >
                      Set rate
                    </button>
                  </div>
                )}
              </div>

              {/* reviews */}
              <div className="space-y-3 rounded-3xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Reviews &amp; ratings
                  </h2>
                  {reviewCount > 0 ? (
                    <p className="text-[14px] text-gray-600">
                      {averageRating != null ? averageRating.toFixed(1) : "–"} ★
                      {" · "}
                      {reviewCount} review{reviewCount === 1 ? "" : "s"}
                    </p>
                  ) : (
                    <p className="text-[14px] text-gray-600">No reviews yet</p>
                  )}
                </div>
                {reviewCount > 0 ? (
                  <ul className="space-y-3">
                    {reviews.map((review) => {
                      const name =
                        `${review.reviewer.firstName || ""} ${
                          review.reviewer.lastName || ""
                        }`.trim() || review.reviewer.email;
                      const jobTitle = review.contract?.job?.title;
                      return (
                        <li
                          key={review.id}
                          className="space-y-1.5 rounded-2xl border border-gray-200/80 bg-white/70 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[14px] font-medium text-black">
                              {name}
                              {jobTitle ? ` · ${jobTitle}` : ""}
                            </p>
                            <p className="text-[14px] text-emerald-600">
                              {review.rating.toFixed(1)} ★
                            </p>
                          </div>
                          {review.comment && (
                            <p className="text-[14px] leading-relaxed text-gray-600">
                              {review.comment}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="mt-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-[14px] text-gray-600">
                    Once clients close contracts with you, their feedback will
                    appear here.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* modal: description about self */}
          {isAboutModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 shadow-[0_30px_120px_rgba(15,23,42,0.9)] sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    About you
                  </h2>
                  <button
                    className="text-[14px] text-gray-600 hover:text-gray-700"
                    onClick={() => setIsAboutModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <form onSubmit={handleAboutSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label
                      className="block text-gray-700"
                      htmlFor="about-description"
                    >
                      Short description
                    </label>
                    <textarea
                      id="about-description"
                      rows={4}
                      value={aboutFormText}
                      onChange={(e) => {
                        setAboutFormText(e.target.value);
                        setAboutError(null);
                      }}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                      placeholder="Describe your experience, what you are good at, and how you help clients."
                    />
                  </div>

                  {aboutError && (
                    <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[14px] text-red-200">
                      {aboutError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-1 text-[14px]">
                    <button
                      type="button"
                      className="rounded-full border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:border-emerald-500 hover:bg-gray-50"
                      onClick={() => setIsAboutModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-black shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
                    >
                      Save description
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* modal: summary stats */}
          {isStatsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 shadow-[0_30px_120px_rgba(15,23,42,0.9)] sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Profile stats
                  </h2>
                  <button
                    className="text-[14px] text-gray-600 hover:text-gray-700"
                    onClick={() => setIsStatsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <form onSubmit={handleStatsSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label
                      className="block text-gray-700"
                      htmlFor="stats-experience"
                    >
                      Experience
                    </label>
                    <input
                      id="stats-experience"
                      type="text"
                      value={statsForm.experience}
                      onChange={handleStatsChange("experience")}
                      className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. 3+ years experience"
                    />
                  </div>
                  <p className="text-[14px] text-black0">
                    Completed jobs and job success will be calculated
                    automatically from finished contracts later.
                  </p>

                  {statsError && (
                    <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[14px] text-red-200">
                      {statsError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-1 text-[14px]">
                    <button
                      type="button"
                      className="rounded-full border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:border-emerald-500 hover:bg-gray-50"
                      onClick={() => setIsStatsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-black shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
                    >
                      Save stats
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* modal: skills */}
          {isSkillsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 shadow-[0_30px_120px_rgba(15,23,42,0.9)] sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Skills &amp; expertise
                  </h2>
                  <button
                    className="text-[14px] text-gray-600 hover:text-gray-700"
                    onClick={() => setIsSkillsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <form onSubmit={handleSkillsSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label
                      className="block text-gray-700"
                      htmlFor="skills-input"
                    >
                      Skills (comma separated)
                    </label>
                    <textarea
                      id="skills-input"
                      rows={3}
                      value={skillsFormText}
                      onChange={(e) => {
                        setSkillsFormText(e.target.value);
                        setSkillsError(null);
                      }}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. Next.js, React, TypeScript, Tailwind CSS"
                    />
                  </div>

                  {skillsError && (
                    <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[14px] text-red-200">
                      {skillsError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-1 text-[14px]">
                    <button
                      type="button"
                      className="rounded-full border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:border-emerald-500 hover:bg-gray-50"
                      onClick={() => setIsSkillsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-black shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
                    >
                      Save skills
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* modal: experience */}
          {isExperienceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 shadow-[0_30px_120px_rgba(15,23,42,0.9)] sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Add experience
                  </h2>
                  <button
                    className="text-[14px] text-gray-600 hover:text-gray-700"
                    onClick={() => setIsExperienceModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <form onSubmit={handleExperienceSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-gray-700" htmlFor="exp-title">
                      Role / title
                    </label>
                    <input
                      id="exp-title"
                      type="text"
                      value={experienceForm.title}
                      onChange={handleExperienceChange("title")}
                      className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. Senior Frontend Developer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-gray-700" htmlFor="exp-org">
                      Company / client
                    </label>
                    <input
                      id="exp-org"
                      type="text"
                      value={experienceForm.org}
                      onChange={handleExperienceChange("org")}
                      className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. Remote · SaaS startup"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-gray-700" htmlFor="exp-period">
                      Period (optional)
                    </label>
                    <input
                      id="exp-period"
                      type="text"
                      value={experienceForm.period}
                      onChange={handleExperienceChange("period")}
                      className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. 2023 — Present"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="block text-gray-700"
                      htmlFor="exp-details"
                    >
                      What you did (optional)
                    </label>
                    <textarea
                      id="exp-details"
                      rows={3}
                      value={experienceForm.details}
                      onChange={handleExperienceChange("details")}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. Led frontend for analytics dashboard using Next.js and Tailwind."
                    />
                  </div>

                  {experienceError && (
                    <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[14px] text-red-200">
                      {experienceError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-1 text-[14px]">
                    <button
                      type="button"
                      className="rounded-full border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:border-emerald-500 hover:bg-gray-50"
                      onClick={() => setIsExperienceModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-black shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
                    >
                      Save experience
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* modal: rate & preferences */}
          {isRateModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 shadow-[0_30px_120px_rgba(15,23,42,0.9)] sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Rate &amp; preferences
                  </h2>
                  <button
                    className="text-[14px] text-gray-600 hover:text-gray-700"
                    onClick={() => setIsRateModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <form onSubmit={handleRateSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-gray-700" htmlFor="rate-rate">
                      Hourly rate
                    </label>
                    <input
                      id="rate-rate"
                      type="text"
                      value={rateForm.hourlyRate}
                      onChange={handleRateChange("hourlyRate")}
                      className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. $45 / hour"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="block text-gray-700"
                      htmlFor="rate-availability"
                    >
                      Availability
                    </label>
                    <input
                      id="rate-availability"
                      type="text"
                      value={rateForm.availability}
                      onChange={handleRateChange("availability")}
                      className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. 20–30 hrs / week"
                    />
                  </div>
                  {rateError && (
                    <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[14px] text-red-200">
                      {rateError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-1 text-[14px]">
                    <button
                      type="button"
                      className="rounded-full border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:border-emerald-500 hover:bg-gray-50"
                      onClick={() => setIsRateModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-black shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
                    >
                      Save rate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* simple modal for adding portfolio when data is not added */}
          {isPortfolioModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 shadow-[0_30px_120px_rgba(15,23,42,0.9)] sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Add portfolio item
                  </h2>
                  <button
                    className="text-[14px] text-gray-600 hover:text-gray-700"
                    onClick={() => setIsPortfolioModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <form onSubmit={handlePortfolioSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label
                      className="block text-gray-700"
                      htmlFor="portfolio-title"
                    >
                      Project title
                    </label>
                    <input
                      id="portfolio-title"
                      type="text"
                      value={portfolioForm.title}
                      onChange={handlePortfolioChange("title")}
                      className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. SaaS analytics dashboard"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="block text-gray-700"
                      htmlFor="portfolio-role"
                    >
                      Your role
                    </label>
                    <input
                      id="portfolio-role"
                      type="text"
                      value={portfolioForm.role}
                      onChange={handlePortfolioChange("role")}
                      className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. Design & build"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="block text-gray-700"
                      htmlFor="portfolio-result"
                    >
                      Result / outcome (optional)
                    </label>
                    <textarea
                      id="portfolio-result"
                      value={portfolioForm.result}
                      onChange={handlePortfolioChange("result")}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-black0 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. Improved conversion by 18%, shipped in 1 week..."
                    />
                  </div>

                  {portfolioError && (
                    <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[14px] text-red-200">
                      {portfolioError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-1 text-[14px]">
                    <button
                      type="button"
                      className="rounded-full border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:border-emerald-500 hover:bg-gray-50"
                      onClick={() => setIsPortfolioModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-black shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
                    >
                      Save project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
