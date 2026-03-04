"use client";

import Link from "next/link";

/**
 * Shared back link used across client and freelancer areas.
 * Same style everywhere: ← label
 */
export default function BackButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={
        className ||
        "inline-flex min-h-11 items-center py-2 text-[12px] text-gray-600 transition hover:text-emerald-600"
      }
    >
      ← {children}
    </Link>
  );
}
