"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const toastId = toast.loading("Logging in...");
      try {
        const response = await axios.post("/api/auth/login", values);

        const data = response.data;
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        if (data.user?.displayName) {
          localStorage.setItem("userName", data.user.displayName);
        }
        toast.success("Login successful! Redirecting...", { id: toastId });

        const targetPath =
          data.user.role === "CLIENT"
            ? "/client/dashboard"
            : "/freelancer/dashboard";
        setTimeout(() => router.push(targetPath), 1000);
      } catch (err: any) {
        console.error("Login failed", err);
        if (err.response && err.response.data) {
          toast.error(err.response.data.error || "Invalid credentials", {
            id: toastId,
          });
        } else {
          toast.error("Failed to connect to server", { id: toastId });
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-white text-black">
      <Toaster position="top-center" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        {/* glow background */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        {/* nav */}
        <header className="relative z-10 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.45)]">
              <span className="text-xl">🐼</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-emerald-600">
                PandaWork
              </span>
              <span className="text-base font-medium text-black">
                Freelance Market
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-3 text-sm text-gray-700">
            <span className="hidden text-gray-600 md:inline">
              New to PandaWork?
            </span>
            <Link
              href="/auth/register"
              className="rounded-full border border-emerald-500 bg-white px-4 py-1.5 text-sm font-medium text-emerald-600 transition hover:border-emerald-600 hover:bg-emerald-50"
            >
              Create account
            </Link>
          </nav>
        </header>

        {/* content */}
        <main className="relative z-10 mt-14 flex flex-1 items-center justify-center">
          <div className="grid w-full max-w-3xl gap-10 rounded-3xl border border-emerald-200 bg-white p-6 shadow-[0_30px_120px_rgba(15,118,110,0.2)] md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:p-8 lg:p-10">
            {/* left side text */}
            <section className="space-y-6">
              <div className="space-y-3">
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[14px] font-medium text-emerald-700">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]" />
                  Welcome back to PandaWork
                </p>
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                  Log in to your{" "}
                  <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                    freelance workspace
                  </span>
                  .
                </h1>
                <p className="text-sm leading-relaxed text-gray-700">
                  Continue managing your projects, proposals and contracts in a
                  minimal Upwork-style environment. Just email and password — no
                  distractions.
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                    ✓
                  </span>
                  <span>
                    Access your dashboard to track active jobs and proposals
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                    ✓
                  </span>
                  <span>
                    Manage contracts, messages, and payments all in one place
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                    ✓
                  </span>
                  <span>
                    Browse jobs or post new projects with secure escrow
                    protection
                  </span>
                </div>
              </div>
            </section>

            {/* right side form */}
            <section className="space-y-5 rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200 sm:p-5">
              <form className="space-y-4" onSubmit={formik.handleSubmit}>
                <div className="space-y-1.5 text-sm">
                  <label className="block text-gray-700" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...formik.getFieldProps("email")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2"
                    placeholder="you@example.com"
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <p className="text-sm text-red-400">
                      {formik.errors.email}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5 text-sm">
                  <label className="block text-gray-700" htmlFor="password">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      {...formik.getFieldProps("password")}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2"
                      placeholder="••••••••"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <FiEyeOff size={16} />
                      ) : (
                        <FiEye size={16} />
                      )}
                    </button>
                  </div>

                  {formik.touched.password && formik.errors.password && (
                    <p className="text-sm text-red-400">
                      {formik.errors.password}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end text-[14px] text-gray-600">
                  <button
                    type="button"
                    className="text-emerald-600 hover:text-emerald-700"
                    onClick={() => router.push("/auth/forgot-password")}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/70"
                >
                  {formik.isSubmitting
                    ? "Logging you in..."
                    : "Log in to PandaWork"}
                </button>

                <p className="pt-1 text-[14px] leading-relaxed text-gray-600">
                  Secure login with encrypted credentials. Your data is
                  protected and your account is safe with PandaWork&apos;s
                  enterprise-grade security.
                </p>
              </form>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
