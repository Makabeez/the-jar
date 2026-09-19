import { cn } from "@/lib/utils";

export function CookieMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("text-primary", className)}
    >
      <path
        d="M9 8.5h14c.8 0 1.5.7 1.5 1.5v2.2c0 .4-.2.8-.5 1.1L22 15.6v8.9c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2v-8.9l-2-2.3c-.3-.3-.5-.7-.5-1.1V10c0-.8.7-1.5 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 8.5c0-2 2.2-3.7 4.5-3.7s4.5 1.7 4.5 3.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12.5 19.5h7M12.5 22.5h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
