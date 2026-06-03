import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "tap-pop inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500",
        destructive: "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-400",
        outline: "border border-white/30 bg-white/45 text-slate-900 backdrop-blur-xl hover:bg-white/65 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
        secondary: "bg-white/60 text-slate-900 shadow-sm backdrop-blur-xl hover:bg-white/75 dark:bg-white/10 dark:text-white",
        ghost: "hover:bg-white/45 dark:hover:bg-white/10",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-6",
        icon: "h-11 w-11 px-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
