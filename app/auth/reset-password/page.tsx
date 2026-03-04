"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";
import { useState, Suspense } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ---------------- VALIDATION ---------------- */
  const validationSchema = Yup.object({
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords do not match")
      .required("Confirm password is required"),
  });

  /* ---------------- FORMIK (ALWAYS CALLED) ---------------- */
  const formik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!token) return;
      const toastId = toast.loading("Updating password...");
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: values.password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error || "Something went wrong", { id: toastId });
          return;
        }
        toast.success("Password updated successfully. You can now log in.", { id: toastId });
        formik.resetForm();
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 1500);
      } catch {
        toast.error("Something went wrong", { id: toastId });
      } finally {
        setSubmitting(false);
      }
    },
  });

  /* ---------------- INVALID TOKEN UI ---------------- */
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Invalid or expired reset link
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Toaster position="top-center" />

      <div className="relative mx-auto flex min-h-screen flex-col px-6 pb-10 pt-6 md:px-8 lg:px-10">
        {/* glow */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        {/* header */}
        <header className="relative z-10 flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-500/50 bg-emerald-500/10">
              🐼
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-emerald-600">
                PandaWork
              </p>
              <p className="text-base text-black">
                Freelance Market
              </p>
            </div>
          </Link>
        </header>

        {/* content */}
        <main className="relative z-10 mt-14 flex flex-1 items-center justify-center">
          <div
            className="grid w-full max-w-3xl gap-10 rounded-3xl border border-emerald-200 bg-white p-6
            shadow-[0_30px_120px_rgba(15,118,110,0.2)]
            md:grid-cols-[1.05fr_0.95fr] items-stretch md:p-8"
          >
            {/* LEFT SIDE (RICH CONTENT) */}
            <section className="flex h-full flex-col justify-center space-y-6">
              <div className="space-y-3">
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[14px] font-medium text-emerald-700">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Secure account update
                </p>

                <h1 className="text-2xl font-semibold sm:text-3xl">
                  Set your{" "}
                  <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                    new password
                  </span>
                  .
                </h1>

                <p className="text-sm leading-relaxed text-gray-700">
                  Choose a strong password to keep your PandaWork account
                  protected and continue managing your freelance projects
                  securely.
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                    ✓
                  </span>
                  <span>Encrypted password update process</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                    ✓
                  </span>
                  <span>One-time secure reset token</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                    ✓
                  </span>
                  <span>Your account remains fully protected</span>
                </div>
              </div>
            </section>

            {/* RIGHT SIDE (ENHANCED FORM) */}
            <section className="flex h-full flex-col justify-center rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200 sm:p-5">
              <div className="mx-auto w-full max-w-sm space-y-4">
                {/* small heading */}
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Update password
                  </h2>
                  <p className="text-sm text-gray-600">
                    Password must be at least 6 characters long.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={formik.handleSubmit}>
                  {/* PASSWORD */}
                  <div className="space-y-1.5 text-sm">
                    <label className="text-gray-700">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        {...formik.getFieldProps("password")}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 outline-none
                        focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                      <p className="text-sm text-red-400">
                        {formik.errors.password}
                      </p>
                    )}
                  </div>

                  {/* CONFIRM */}
                  <div className="space-y-1.5 text-sm">
                    <label className="text-gray-700">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        {...formik.getFieldProps("confirmPassword")}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 outline-none
                        focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {formik.touched.confirmPassword &&
                      formik.errors.confirmPassword && (
                        <p className="text-sm text-red-400">
                          {formik.errors.confirmPassword}
                        </p>
                      )}
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-white
                    shadow-[0_18px_60px_rgba(16,185,129,0.55)] hover:bg-emerald-400"
                  >
                    Update password
                  </button>
                </form>

                <p className="pt-1 text-[14px] leading-relaxed text-gray-600">
                  This reset link is valid for a limited time for security
                  reasons.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}