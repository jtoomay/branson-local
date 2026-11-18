"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { IconAlert, IconCheck, IconX } from "./icons";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; message: string };
type ToastApi = {
  toast: (message: string, kind?: ToastKind) => void;
  /** Convenience: show success/error based on an ActionResult. */
  result: (r: { ok: boolean; message: string }) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "success") => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, kind, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), kind === "error" ? 7000 : 4000),
      );
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({ toast, result: (r) => toast(r.message, r.ok ? "success" : "error") }),
    [toast],
  );

  const polite = toasts.filter((t) => t.kind !== "error");
  const assertive = toasts.filter((t) => t.kind === "error");

  return (
    <ToastContext value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
        {/* Separate live regions so errors interrupt and successes don't. Regions stay mounted. */}
        <div role="status" aria-live="polite" aria-atomic="false" className="flex flex-col items-center gap-2 sm:items-end">
          {polite.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
        <div role="alert" aria-live="assertive" aria-atomic="false" className="flex flex-col items-center gap-2 sm:items-end">
          {assertive.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      </div>
    </ToastContext>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const isError = toast.kind === "error";
  return (
    <div
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-zinc-200 bg-white/95 p-3 pr-2 text-sm text-zinc-800 shadow-lg shadow-zinc-900/10 backdrop-blur motion-safe:animate-[admin-toast-in_160ms_ease-out]"
    >
      <span
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
          isError ? "bg-red-100 text-red-700" : "bg-[#155D6B]/10 text-[#155D6B]"
        }`}
      >
        {isError ? <IconAlert size={12} /> : <IconCheck size={12} />}
      </span>
      <p className="min-w-0 flex-1 py-0.5 leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="grid size-6 shrink-0 place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-[#155D6B]"
        aria-label="Dismiss notification"
      >
        <IconX size={14} />
      </button>
      <style>{`@keyframes admin-toast-in{from{opacity:0;transform:translateY(6px) scale(.98)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
