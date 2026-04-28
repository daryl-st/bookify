"use client";

import { cn } from "@/lib/utils";

/**
 * Shows seeded demo credentials in development only.
 */
export function SeedLoginHint({ className }: { className?: string }) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-left text-xs text-muted-foreground",
        className
      )}
    >
      <p className="font-medium text-foreground">Local demo logins</p>
      <ul className="mt-1.5 list-inside list-disc space-y-0.5">
        <li>
          Admin: <code className="rounded bg-muted px-1 py-px text-foreground">admin@bookify.test</code>
        </li>
        <li>
          Customer:{" "}
          <code className="rounded bg-muted px-1 py-px text-foreground">customer@bookify.test</code>
        </li>
      </ul>
      <p className="mt-1.5">
        Password (both):{" "}
        <code className="rounded bg-muted px-1 py-px text-foreground">password123</code>
      </p>
      <p className="mt-1.5 opacity-90">
        Run <code className="rounded bg-muted px-1 py-px">npm run prisma:seed</code> if these accounts
        are missing.
      </p>
    </div>
  );
}
