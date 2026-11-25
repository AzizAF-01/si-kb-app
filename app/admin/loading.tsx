export default function AdminLoading() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      {/* Header Skeleton */}
      <div className="pb-4 border-b border-slate-200">
        <div className="h-8 w-64 bg-slate-200 rounded-lg mb-2"></div>
        <div className="h-4 w-96 max-w-full bg-slate-100 rounded"></div>
      </div>

      {/* Card & Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="h-5 w-48 bg-slate-200 rounded"></div>
          <div className="h-6 w-24 bg-slate-200 rounded-md"></div>
        </div>

        <div className="p-6 space-y-4">
          <div className="h-10 w-full bg-slate-100 rounded-lg"></div>
          <div className="h-12 w-full bg-slate-50 rounded-lg"></div>
          <div className="h-12 w-full bg-slate-50 rounded-lg"></div>
          <div className="h-12 w-full bg-slate-50 rounded-lg"></div>
          <div className="h-12 w-full bg-slate-50 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
