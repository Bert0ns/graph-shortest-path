import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function ExampleGraphCardSkeleton() {
  return (
    <div
      className="group block rounded-md border border-border p-4 bg-card/70"
      aria-busy
      aria-live="polite"
      aria-label="Loading example graph card"
    >
      <div className="flex items-start justify-between gap-2">
        {/* title */}
        <Skeleton className="h-4 w-40" />
        {/* Meta (Weighted/Directed) */}
        <Skeleton className="h-3 w-32" />
      </div>
      {/* description */}
      <div className="mt-2 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

export default ExampleGraphCardSkeleton;

