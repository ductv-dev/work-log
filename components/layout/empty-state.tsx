import { FileQuestion } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <FileQuestion className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 font-medium">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
