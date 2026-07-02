export function BookListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-24 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function BookDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="h-32 animate-pulse rounded bg-slate-200" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-24 animate-pulse rounded bg-slate-200" />
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-8 w-16 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  )
}
