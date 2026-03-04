"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // Ensure 'role' is set in localStorage during login (e.g., "client" or "freelancer")
    const role = localStorage.getItem("role");
    console.log(role, "rrrr");

    const publicPaths = [
      "/auth/login",
      "/auth/register",
      "/auth/reset-password",
      "/auth/forgot-password",
    ];
    const isPublicPath =
      publicPaths.includes(pathname) || pathname.startsWith("/auth/");
    const isProtectedPath =
      pathname.startsWith("/client") || pathname.startsWith("/freelancer");

    if (token) {
      // User is logged in
      if (isPublicPath) {
        // Redirect to dashboard if on public path
        if (role === "CLIENT") {
          router.replace("/client/dashboard");
        } else {
          router.replace("/freelancer/dashboard");
        }
      } else {
        // Check role access for protected paths
        if (pathname.startsWith("/client") && role !== "CLIENT") {
          router.replace("/freelancer/dashboard");
        } else if (pathname.startsWith("/freelancer") && role === "CLIENT") {
          router.replace("/client/dashboard");
        } else {
          setAuthorized(true);
        }
      }
    } else {
      // User is not logged in
      if (isProtectedPath) {
        router.replace("/auth/login");
      } else {
        setAuthorized(true);
      }
    }
  }, [router, pathname]);

  const isProtectedPath =
    pathname.startsWith("/client") || pathname.startsWith("/freelancer");

  // If on a protected path and not yet authorized, show nothing (or a loader)
  if (isProtectedPath && !authorized) {
    return null;
  }

  return <>{children}</>;
}
