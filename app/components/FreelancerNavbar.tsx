"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";

export default function FreelancerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userRoll, setUserRoll] = useState("");
  const [savedCount, setSavedCount] = useState<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;

        const res = await axios.get("/api/freelancer/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;
        const { user, profile, avatarUrl } = data;

        // Get profile image
// console.log("PROFILE:", avatarUrl);
        if (user?.username) setUserName(user.username);
        if (avatarUrl) setAvatarUrl(avatarUrl || null);
        if (user?.role) setUserRoll(user.role);

        console.log("PROFILE:", profile,avatarUrl);
      } catch {
        // Keep default values
      }
    };

    fetchProfileData();
  }, []);

  // Saved jobs count from API (and refetch on custom event when user saves/unsaves)
  const fetchSavedCount = useCallback(async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setSavedCount(0);
        return;
      }
      const res = await axios.get("/api/freelancer/saved-jobs/count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      const count = Number(data?.count);
      setSavedCount(Number.isNaN(count) ? 0 : Math.max(0, count));
    } catch {
      setSavedCount(0);
    }
  }, []);

  useEffect(() => {
    fetchSavedCount();
    const handler = () => fetchSavedCount();
    if (typeof window !== "undefined") {
      window.addEventListener("savedJobsCountChange", handler);
      return () => window.removeEventListener("savedJobsCountChange", handler);
    }
  }, [fetchSavedCount, pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement)?.closest?.("[data-mobile-menu-toggle]")
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (profileMenuOpen || mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen, mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setProfileMenuOpen(false);
    router.push("/auth/login");
  };

  const isDashboard = pathname === "/freelancer/dashboard";
  const isFindWork = pathname.startsWith("/freelancer/jobs") && !pathname.startsWith("/freelancer/saved");
  const isSavedJobs = pathname === "/freelancer/saved";
  const isProposals = pathname === "/freelancer/proposals";
  const isInvites = pathname === "/freelancer/invites";
  const isContracts = pathname.startsWith("/freelancer/contracts");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[100vw] items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 md:px-8 lg:px-10">
        {/* Left: Menu icon (mobile) + Logo + project name + Nav Tabs (desktop) */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
          {/* Mobile menu button - left on mobile */}
          <button
            type="button"
            data-mobile-menu-toggle
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <Link href="/freelancer/dashboard" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <span className="text-lg">🐼</span>
            </div>
            <span className="text-medium font-semibold tracking-tight text-emerald-600">
              PandaWork
            </span>
          </Link>

          {/* Navigation Tabs - desktop */}
          <nav className="hidden items-center gap-1 overflow-visible md:flex">
            <Link
              href="/freelancer/dashboard"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                isDashboard
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/freelancer/jobs"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                isFindWork
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Find work
            </Link>
            <Link
              href="/freelancer/saved"
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                isSavedJobs
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>Saved jobs</span>
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[14px] font-bold tabular-nums ${
                  savedCount > 0
                    ? "bg-emerald-500 text-white ring-2 ring-white"
                    : "bg-gray-300 text-gray-600"
                }`}
                aria-label={`${savedCount} saved jobs`}
              >
                {savedCount > 99 ? "99+" : savedCount}
              </span>
            </Link>
            <Link
              href="/freelancer/proposals"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                isProposals
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Proposals
            </Link>
            <Link
              href="/freelancer/invites"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                isInvites
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Invites
            </Link>
            <Link
              href="/freelancer/contracts"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                isContracts
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Contracts
            </Link>
            <Link
              href="/freelancer/withdrawals"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                pathname === "/freelancer/withdrawals"
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Manage finance
            </Link>
          </nav>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="fixed inset-x-0 top-14.25 z-40 max-h-[calc(100vh-57px)] overflow-y-auto border-b border-gray-200 bg-white md:hidden"
          >
            <nav className="flex flex-col gap-0 p-2">
              <Link href="/freelancer/dashboard" onClick={() => setMobileMenuOpen(false)} className={`rounded-lg px-4 py-3 text-sm font-medium ${isDashboard ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}>Dashboard</Link>
              <Link href="/freelancer/jobs" onClick={() => setMobileMenuOpen(false)} className={`rounded-lg px-4 py-3 text-sm font-medium ${isFindWork ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}>Find work</Link>
              <Link href="/freelancer/saved" onClick={() => setMobileMenuOpen(false)} className={`rounded-lg px-4 py-3 text-sm font-medium ${isSavedJobs ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}>Saved jobs {savedCount > 0 ? `(${savedCount})` : ""}</Link>
              <Link href="/freelancer/proposals" onClick={() => setMobileMenuOpen(false)} className={`rounded-lg px-4 py-3 text-sm font-medium ${isProposals ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}>Proposals</Link>
              <Link href="/freelancer/invites" onClick={() => setMobileMenuOpen(false)} className={`rounded-lg px-4 py-3 text-sm font-medium ${isInvites ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}>Invites</Link>
              <Link href="/freelancer/contracts" onClick={() => setMobileMenuOpen(false)} className={`rounded-lg px-4 py-3 text-sm font-medium ${isContracts ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}>Contracts</Link>
              <Link href="/freelancer/withdrawals" onClick={() => setMobileMenuOpen(false)} className={`rounded-lg px-4 py-3 text-sm font-medium ${pathname === "/freelancer/withdrawals" ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}>Manage finance</Link>
            </nav>
          </div>
        )}

        {/* Right: Profile Avatar with Dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-gray-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 ring-2 ring-emerald-200 overflow-hidden">
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
            <div className="hidden flex-col items-start text-left md:flex">
              <span className="text-sm font-medium text-gray-900">{userName}</span>
              <span className="text-[12px] text-gray-500">{userRoll}</span>
            </div>
            <svg
              className={`h-4 w-4 text-gray-400 transition ${
                profileMenuOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-[12px] text-gray-500">{userRoll}</p>
              </div>
              <div className="p-1">
                <Link
                  href="/freelancer/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  View profile
                </Link>   
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
