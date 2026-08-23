type LotTableSkeletonProps = { rows?: number };

export function LotTableSkeleton({ rows = 5 }: LotTableSkeletonProps) {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="flex gap-5 border-b border-slate-100 bg-slate-50 px-5 py-3">
        {[...Array(5)].map((_, index) => <div key={index} className="h-3 flex-1 rounded bg-slate-200" />)}
      </div>
      {[...Array(rows)].map((_, row) => (
        <div key={row} className="flex gap-5 border-b border-slate-100 px-5 py-4">
          {[...Array(5)].map((_, cell) => <div key={cell} className="h-4 flex-1 rounded bg-slate-100" />)}
        </div>
      ))}
    </div>
  );
}
