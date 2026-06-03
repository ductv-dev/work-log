import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const IOSInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      className={cn(
        "h-12 rounded-2xl border-white/25 bg-white/55 px-4 shadow-inner shadow-white/20 backdrop-blur-xl dark:bg-black/25",
        className
      )}
      {...props}
    />
  )
);

IOSInput.displayName = "IOSInput";
