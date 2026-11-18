"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { btn } from "./ui";
import { IconAlert, IconSpinner, IconX } from "./icons";

/**
 * Accessible modal built on the native <dialog> element: showModal() gives us focus trapping,
 * Escape to close, inert background and focus restoration for free.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "sm",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself, outside the panel) closes.
        if (e.target === e.currentTarget) onClose();
      }}
      className={`m-auto w-[calc(100%-2rem)] ${
        size === "lg" ? "max-w-2xl" : "max-w-md"
      } rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl shadow-zinc-900/20 backdrop:bg-zinc-950/40 backdrop:backdrop-blur-[2px] open:motion-safe:animate-[admin-dialog-in_140ms_ease-out]`}
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-start justify-between gap-4 px-5 pt-5">
            <div>
              <h2 id={titleId} className="text-base font-semibold text-zinc-900">
                {title}
              </h2>
              {description && (
                <div id={descId} className="mt-1 text-sm text-zinc-500">
                  {description}
                </div>
              )}
            </div>
            <button type="button" onClick={onClose} className={btn.icon} aria-label="Close dialog">
              <IconX />
            </button>
          </div>
          {children && <div className="overflow-y-auto px-5 pt-4">{children}</div>}
          {footer && <div className="mt-5 flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/60 px-5 py-3.5 sm:flex-row sm:justify-end">{footer}</div>}
        </div>
      )}
      <style>{`@keyframes admin-dialog-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}`}</style>
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  pending = false,
  disabled = false,
  tone = "danger",
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  pending?: boolean;
  disabled?: boolean;
  tone?: "danger" | "primary";
  children?: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title={
        <span className="flex items-center gap-2">
          {tone === "danger" && (
            <span className="grid size-7 place-items-center rounded-full bg-red-50 text-red-600">
              <IconAlert size={15} />
            </span>
          )}
          {title}
        </span>
      }
      description={description}
      footer={
        <>
          <button type="button" className={btn.secondary} onClick={onClose} disabled={pending}>
            Cancel
          </button>
          <button
            type="button"
            className={tone === "danger" ? btn.danger : btn.primary}
            onClick={onConfirm}
            disabled={pending || disabled}
            aria-busy={pending}
          >
            {pending && <IconSpinner />}
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
