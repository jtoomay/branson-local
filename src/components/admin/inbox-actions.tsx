"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { deleteSubmission, setSubmissionHandled } from "@/lib/admin/actions/inbox";
import { ConfirmDialog } from "./dialog";
import { IconCheck, IconSpinner, IconTrash } from "./icons";
import { useToast } from "./toast";
import { btn } from "./ui";

export function InboxActions({ id, handled, name, backHref }: { id: string; handled: boolean; name: string; backHref: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const [optimisticHandled, setOptimisticHandled] = useOptimistic(handled);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={optimisticHandled ? btn.secondary : btn.primary}
        disabled={pending}
        aria-pressed={optimisticHandled}
        onClick={() =>
          start(async () => {
            setOptimisticHandled(!optimisticHandled);
            toast.result(await setSubmissionHandled(id, !optimisticHandled));
          })
        }
      >
        {pending ? <IconSpinner /> : <IconCheck />}
        {optimisticHandled ? "Mark as unhandled" : "Mark as handled"}
      </button>
      <button type="button" className={btn.dangerSoft} onClick={() => setConfirm(true)}>
        <IconTrash />
        Delete
      </button>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        pending={deleting}
        title="Delete this message?"
        description={`The message from ${name} will be permanently deleted.`}
        confirmLabel="Delete message"
        onConfirm={() =>
          startDelete(async () => {
            const res = await deleteSubmission(id);
            toast.result(res);
            if (res.ok) {
              setConfirm(false);
              router.replace(backHref);
            }
          })
        }
      />
    </div>
  );
}
