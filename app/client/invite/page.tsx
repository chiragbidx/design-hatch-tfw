"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect to My jobs – invite flow starts from client's jobs, then freelancer list, then profile.
 */
export default function ClientInviteRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/client/jobs");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-black">
      <p className="text-sm text-gray-600">Redirecting to My jobs…</p>
    </div>
  );
}
