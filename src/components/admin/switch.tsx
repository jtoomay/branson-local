"use client";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  size = "md",
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: "sm" | "md";
  id?: string;
}) {
  const track = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const knob = size === "sm" ? "size-4 data-[on=true]:translate-x-4" : "size-5 data-[on=true]:translate-x-5";
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155D6B] disabled:cursor-wait disabled:opacity-60 ${track} ${
        checked ? "bg-[#155D6B]" : "bg-zinc-300 hover:bg-zinc-400/80"
      }`}
    >
      <span
        data-on={checked}
        className={`pointer-events-none inline-block translate-x-0 rounded-full bg-white shadow-sm ring-1 ring-zinc-900/5 transition-transform ${knob}`}
      />
    </button>
  );
}
