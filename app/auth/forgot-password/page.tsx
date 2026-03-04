// panda_upwork/app/auth/forgot-password/page.tsx
"use client";

import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

export default function ForgotPasswordPage() {
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const toastId = toast.loading("Sending reset link...");
      try {
        await axios.post("/api/auth/forgot-password", { email: values.email });
        toast.success("If an account exists with this email, you will receive a reset link. Check your inbox and spam folder.", { id: toastId });
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || "Something went wrong";
        toast.error(errorMsg, { id: toastId });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-white text-black">
      <Toaster position="top-center" />

      <div className="relative mx-auto flex min-h-screen flex-col px-6 pb-10 pt-6 md:px-8 lg:px-10">
        {/* glow */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        {/* header */}
        <header className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-500/50 bg-emerald-500/10">
              🐼
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-600">
                PandaWork
              </p>
              <p className="text-base">Freelance Market</p>
            </div>
          </Link>

          <Link
            href="/auth/login"
            className="rounded-full border border-emerald-500 px-4 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
          >
            Login
          </Link>
        </header>

        {/* content */}
        <main className="relative z-10 mt-14 flex flex-1 items-center justify-center">
          <div
            className="grid w-full max-w-3xl gap-10 rounded-3xl border border-emerald-200 bg-white p-6
            shadow-[0_30px_120px_rgba(15,118,110,0.2)]
            md:grid-cols-[1.05fr_0.95fr] items-stretch md:p-8"
          >
            {/* LEFT */}
            <section className="flex h-full flex-col justify-center space-y-6">
              <section className="flex h-full flex-col justify-center space-y-6">
                <div className="space-y-3">
                  <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[14px] font-medium text-emerald-700">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Account recovery
                  </p>

                  <h1 className="text-2xl font-semibold sm:text-3xl">
                    Forgot your{" "}
                    <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                      PandaWork password
                    </span>
                    ?
                  </h1>

                  <p className="text-sm leading-relaxed text-gray-700">
                    No worries — it happens. Enter your registered email address
                    and we’ll send you a secure link to reset your password and
                    get you back to work quickly.
                  </p>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                      ✓
                    </span>
                    <span>Secure email-based verification</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                      ✓
                    </span>
                    <span>Time-limited password reset link</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                      ✓
                    </span>
                    <span>Your account stays fully protected</span>
                  </div>
                </div>
              </section>
            </section>

            {/* RIGHT */}

            <section className="flex h-full flex-col justify-center rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200 sm:p-5">
              <div className="mx-auto w-full max-w-sm space-y-4">
                {/* small heading */}
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Reset your password
                  </h2>
                  <p className="text-sm text-gray-600">
                    We’ll email you a secure link to reset your password.
                  </p>
                </div>

                {/* form */}
                <form className="space-y-4" onSubmit={formik.handleSubmit}>
                  <div className="space-y-1.5 text-sm">
                    <label className="text-gray-700">Email</label>
                    <input
                      type="email"
                      {...formik.getFieldProps("email")}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none
          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                      placeholder="you@example.com"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-sm text-red-400">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-white
        shadow-[0_18px_60px_rgba(16,185,129,0.55)] hover:bg-emerald-400"
                  >
                    Send reset link
                  </button>
                </form>

                {/* helper / trust text */}
                <p className="pt-1 text-[14px] leading-relaxed text-gray-600">
                  For security reasons, this link will expire in a short time.
                  If you don’t see the email, please check your spam folder.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
