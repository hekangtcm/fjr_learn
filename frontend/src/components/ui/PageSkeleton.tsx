export function PageSkeleton() {
  return (
    <div className="animate-pulse min-h-screen">
      <div className="bg-slate-200 dark:bg-slate-700 h-16" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-slate-200 dark:bg-slate-700 rounded-lg h-8 w-1/4 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="bg-slate-200 dark:bg-slate-700 rounded-lg h-48" />
              <div className="bg-slate-200 dark:bg-slate-700 rounded h-4 w-3/4" />
              <div className="bg-slate-200 dark:bg-slate-700 rounded h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
