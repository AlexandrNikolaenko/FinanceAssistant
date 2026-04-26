import * as React from "react";

import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-2xl border border-border bg-background/80 px-4 text-sm text-foreground outline-none transition-colors focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}
