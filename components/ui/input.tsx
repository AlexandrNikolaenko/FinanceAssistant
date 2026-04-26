import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({
  className,
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-2xl border border-border bg-background/80 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent",
        className,
      )}
      type={type}
      {...props}
    />
  );
}
