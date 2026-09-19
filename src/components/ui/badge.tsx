import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-surface-2 text-muted",
        solid: "bg-primary text-primary-fg",
        fortune: "bg-surface-2 text-fg",
        crumb: "bg-surface-2 text-fg",
        pulse: "bg-surface-2 text-muted",
        burn: "bg-danger-soft text-danger",
        agent: "bg-success-soft text-success",
        live: "bg-success-soft text-success",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
