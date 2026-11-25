export default function MainLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-6xl animate-pulse space-y-8">
      {/* Header Skeleton */}
      <div className="max-w-2xl space-y-4">
        <div className="h-4 w-32 bg-blue-100 rounded-full"></div>
        <div className="h-10 w-3/4 bg-slate-200 rounded-xl"></div>
        <div className="h-4 w-full bg-slate-100 rounded"></div>
        <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="h-12 w-12 bg-slate-100 rounded-2xl"></div>
            <div className="h-6 w-3/4 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-full bg-slate-100 rounded"></div>
            <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
