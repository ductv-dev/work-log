"use client";

import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type ToastPayload = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

const listeners = new Set<(toast: ToastPayload) => void>();

export function toast(payload: ToastPayload) {
  listeners.forEach((listener) => listener(payload));
}

export function Toaster() {
  const [items, setItems] = React.useState<(ToastPayload & { id: number })[]>([]);

  React.useEffect(() => {
    const listener = (payload: ToastPayload) => {
      const id = Date.now();
      setItems((current) => [...current, { ...payload, id }]);
      window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4500);
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <ToastPrimitives.Provider swipeDirection="right">
      {items.map((item) => (
        <ToastPrimitives.Root
          key={item.id}
          className={cn(
            "grid w-full max-w-sm grid-cols-[1fr_auto] items-start gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-lg",
            item.variant === "destructive" && "border-destructive"
          )}
          open
        >
          <div>
            <ToastPrimitives.Title className="text-sm font-semibold">{item.title}</ToastPrimitives.Title>
            {item.description ? (
              <ToastPrimitives.Description className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </ToastPrimitives.Description>
            ) : null}
          </div>
          <ToastPrimitives.Close className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
            <X className="h-4 w-4" />
          </ToastPrimitives.Close>
        </ToastPrimitives.Root>
      ))}
      <ToastPrimitives.Viewport className="fixed bottom-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 outline-none" />
    </ToastPrimitives.Provider>
  );
}
