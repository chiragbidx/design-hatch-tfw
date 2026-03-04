"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function ClientNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("userName") || "Client" : "Client"
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    const storedName = typeof window !== "undefined" ? localStorage.getItem("userName") : null;
    if (storedName) setUserName(storedName);
    axios.get("/api/client/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const data = res.data;
        if (data?.userName) {
          setUserName(data.userName);
          if (typeof window !== "undefined") localStorage.setItem("userName", data.userName);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen, mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
    }
    setProfileMenuOpen(false);
    router.push("/auth/login");
  };

  const isDashboard = pathname === "/client/dashboard";
  const isJobPost = pathname === "/client/jobpost";
  const isJobs = pathname.startsWith("/client/jobs");
  const isProposals = pathname === "/client/proposals";
  const isContracts = pathname.startsWith("/client/contracts");

  const navLinkClass = (active: boolean) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition ${
      active
        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[100vw] items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 md:px-8 lg:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
          {/* Mobile menu button - left on mobile, opens nav menu */}
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

          <Link
            href="/client/dashboard"
            className="flex shrink-0 items-center gap-2.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <span className="text-lg">🐼</span>
            </div>
            <span className="text-medium font-semibold tracking-tight text-emerald-600">
              PandaWork
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/client/dashboard"
              className={navLinkClass(isDashboard)}
            >
              Dashboard
            </Link>
            <Link
              href="/client/jobpost"
              className={navLinkClass(isJobPost)}
            >
              Post job
            </Link>
            <Link href="/client/jobs" className={navLinkClass(isJobs)}>
              My jobs
            </Link>
            <Link
              href="/client/proposals"
              className={navLinkClass(isProposals)}
            >
              Proposals
            </Link>
            <Link
              href="/client/contracts"
              className={navLinkClass(isContracts)}
            >
              Contracts
            </Link>
          </nav>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-gray-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 ring-2 ring-emerald-200">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden flex-col items-start text-left md:flex">
              <span className="text-sm font-medium text-gray-900">{userName}</span>
              <span className="text-[12px] text-gray-500">Client</span>
            </div>
            <svg
              className={`h-4 w-4 text-gray-400 transition ${profileMenuOpen ? "rotate-180" : ""}`}
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

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 px-3 py-2">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-[12px] text-gray-500">Client</p>
              </div>
              <div className="p-1">
                <Link
                  href="/client/dashboard"
                  onClick={() => setProfileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu panel - outside flex row so it overlays full width */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute left-0 right-0 top-full z-100 max-h-[calc(100vh-57px)] overflow-y-auto border-b border-gray-200 bg-white shadow-lg md:hidden"
        >
          <nav className="flex flex-col gap-0 p-2">
            <Link
              href="/client/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-sm font-medium ${isDashboard ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}
            >
              Dashboard
            </Link>
            <Link
              href="/client/jobpost"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-sm font-medium ${isJobPost ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}
            >
              Post job
            </Link>
            <Link
              href="/client/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-sm font-medium ${isJobs ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}
            >
              My jobs
            </Link>
            <Link
              href="/client/proposals"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-sm font-medium ${isProposals ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}
            >
              Proposals
            </Link>
            <Link
              href="/client/contracts"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-sm font-medium ${isContracts ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}
            >
              Contracts
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
