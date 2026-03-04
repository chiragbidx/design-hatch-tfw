"use client";

import { useEffect, useRef } from "react";

export interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** If set, shows Confirm + Cancel. Otherwise single OK button. */
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" styles the confirm button as destructive (e.g. red). */
  variant?: "default" | "danger";
}

export default function AlertModal({
  open,
  onClose,
  title,
  message,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
}: AlertModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    focusRef.current?.focus();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const isConfirm = typeof onConfirm === "function";

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      aria-describedby="alert-modal-desc"
      className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="alert-modal-title"
          className="text-base font-semibold text-black"
        >
          {title}
        </h2>
        <p
          id="alert-modal-desc"
          className="mt-2 text-sm text-gray-600 whitespace-pre-wrap"
        >
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {isConfirm ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {cancelLabel}
              </button>
              <button
                ref={focusRef}
                type="button"
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                className={
                  variant === "danger"
                    ? "rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                    : "rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                }
              >
                {confirmLabel}
              </button>
            </>
          ) : (
            <button
              ref={focusRef}
              type="button"
              onClick={onClose}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
