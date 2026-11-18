"use client";

import { btn, Card } from "@/components/admin/ui";
import { IconAlert } from "@/components/admin/icons";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card>
      <div role="alert" className="flex flex-col items-center px-6 py-16 text-center">
        <div className="mb-3 grid size-11 place-items-center rounded-full bg-red-50 text-red-600">
          <IconAlert size={20} />
        </div>
        <h1 className="text-base font-semibold text-zinc-900">Something went wrong</h1>
        <p className="mt-1 max-w-sm text-sm text-zinc-500">
          {error.digest ? `The server hit an error (ref ${error.digest}).` : error.message || "An unexpected error occurred."}
        </p>
        <button type="button" onClick={reset} className={`${btn.primary} mt-5`}>
          Try again
        </button>
      </div>
    </Card>
  );
}
