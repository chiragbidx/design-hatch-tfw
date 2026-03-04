"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";

type Role = "client" | "freelancer";

interface FormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

function RegisterForm() {
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialRole = useMemo<Role>(() => {
    const value = searchParams.get("role");
    return value === "freelancer" || value === "client" ? value : "client";
  }, [searchParams]);

  const [role, setRole] = useState<Role>(initialRole);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const toastId = toast.loading("Creating account...");
      try {
        await axios.post("/api/auth/signup", { ...values, role: role.toUpperCase() });

        toast.success("Signup successful! Redirecting to login...", {
          id: toastId,
        });
        setTimeout(() => router.push("/auth/login"), 1500);
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || "Failed to connect to server.";
        toast.error(errorMsg, { id: toastId });
      }
      setSubmitting(false);
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
              Already have an account?
            </span>
            <Link
              href="/auth/login"
              className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:border-emerald-500 hover:bg-gray-50"
            >
              Log in
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
                  Simple PandaWork onboarding
                </p>
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                  Join as a{" "}
                  <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                    {role === "client" ? "client" : "freelancer"}
                  </span>
                  .
                </h1>
                <p className="text-sm leading-relaxed text-gray-700">
                  Choose how you want to use the platform. Whether you&apos;re
                  hiring for your next project or offering services, this flow
                  keeps things minimal and focused.
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                {role === "client" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                        ✓
                      </span>
                      <span>
                        Post jobs and find skilled freelancers for your projects
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                        ✓
                      </span>
                      <span>
                        Review proposals, manage contracts, and track project
                        progress
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                        ✓
                      </span>
                      <span>
                        Secure payments with escrow protection for peace of mind
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                        ✓
                      </span>
                      <span>
                        Browse thousands of job opportunities across all skill
                        levels
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                        ✓
                      </span>
                      <span>
                        Build your profile, showcase your portfolio, and get
                        hired
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[14px] text-emerald-600">
                        ✓
                      </span>
                      <span>
                        Get paid securely with guaranteed escrow protection
                      </span>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* right side form */}
            <section className="space-y-5 rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200 sm:p-5">
              {/* role toggle */}
              <div className="grid grid-cols-2 rounded-full bg-gray-200 p-1 text-sm text-gray-700 ring-1 ring-gray-300">
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`inline-flex items-center justify-center rounded-full px-3 py-2 font-medium transition ${
                    role === "client"
                      ? "bg-emerald-500 text-white shadow-[0_10px_35px_rgba(16,185,129,0.6)]"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  I&apos;m a client
                </button>
                <button
                  type="button"
                  onClick={() => setRole("freelancer")}
                  className={`inline-flex items-center justify-center rounded-full px-3 py-2 font-medium transition ${
                    role === "freelancer"
                      ? "bg-emerald-500 text-white shadow-[0_10px_35px_rgba(16,185,129,0.6)]"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  I&apos;m a freelancer
                </button>
              </div>

              <form className="space-y-4" onSubmit={formik.handleSubmit}>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-gray-700" htmlFor="firstName">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      {...formik.getFieldProps("firstName")}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. Aarav"
                    />
                    {formik.touched.firstName && formik.errors.firstName ? (
                      <p className="text-sm text-red-400">
                        {formik.errors.firstName}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5 ">
                    <label className="block text-gray-700" htmlFor="lastName">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      {...formik.getFieldProps("lastName")}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2"
                      placeholder="e.g. Shah"
                    />
                    {formik.touched.lastName && formik.errors.lastName ? (
                      <p className="text-sm text-red-400">
                        {formik.errors.lastName}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  <label className="block text-gray-700" htmlFor="username">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    {...formik.getFieldProps("username")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2"
                    placeholder="e.g. panda_creator"
                  />
                </div>
                {formik.touched.username && formik.errors.username ? (
                  <p className="text-sm text-red-400">
                    {formik.errors.username}
                  </p>
                ) : null}

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
                </div>
                {formik.touched.email && formik.errors.email ? (
                  <p className="text-sm text-red-400">{formik.errors.email}</p>
                ) : null}

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-gray-700" htmlFor="password">
                      Password
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
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

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label
                      className="block text-gray-700"
                      htmlFor="confirmPassword"
                    >
                      Confirm password
                    </label>

                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...formik.getFieldProps("confirmPassword")}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-black outline-none ring-emerald-500/50 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2"
                        placeholder="Repeat password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>

                    {formik.touched.confirmPassword &&
                      formik.errors.confirmPassword && (
                        <p className="text-sm text-red-400">
                          {formik.errors.confirmPassword}
                        </p>
                      )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/70"
                >
                  {formik.isSubmitting
                    ? "Creating your account..."
                    : role === "client"
                      ? "Create client account"
                      : "Create freelancer account"}
                </button>

                <p className="pt-1 text-[14px] leading-relaxed text-gray-600">
                  By creating an account, you agree to PandaWork&apos;s Terms of
                  Service and Privacy Policy. We protect your data and ensure
                  secure transactions for all users on our platform.
                </p>
              </form>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
