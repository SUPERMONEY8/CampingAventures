/**
 * Dashboard Loading Skeleton
 * 
 * Skeleton loader for dashboard page.
 */

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="medical-card h-24 bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>

      {/* Next Trip Skeleton */}
      <div className="medical-card h-64 bg-gray-200 dark:bg-gray-700" />

      {/* Activity Timeline Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        ))}
      </div>

      {/* Recommendations Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="medical-card h-48 bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    </div>
  );
}

