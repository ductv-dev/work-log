"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton({
  alwaysVisible = false,
  children = "Cài app",
  className,
  variant = "secondary"
}: {
  alwaysVisible?: boolean;
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
}) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if ((!promptEvent && !alwaysVisible) || installed) return null;

  async function install() {
    if (!promptEvent) {
      toast({
        title: "Cài WorkLog",
        description: "Trên iPhone: bấm Share rồi chọn Add to Home Screen. Trên Chrome/Edge: mở menu trình duyệt rồi chọn Install app."
      });
      return;
    }

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setPromptEvent(null);
  }

  return (
    <Button type="button" variant={variant} onClick={install} className={cn(className)}>
      <Download className="h-4 w-4" />
      {children}
    </Button>
  );
}
