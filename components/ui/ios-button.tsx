import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function IOSButton({ className, size = "lg", ...props }: ButtonProps) {
  return (
    <Button
      size={size}
      className={cn("h-12 rounded-full px-6 text-[15px] font-semibold shadow-lg shadow-indigo-500/20", className)}
      {...props}
    />
  );
}
