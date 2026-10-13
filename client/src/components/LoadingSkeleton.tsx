const Pulse = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-muted/60 rounded-lg ${className}`} />
);

export const CategoryGridSkeleton = () => (
  <div className="py-10 md:py-16 px-4 md:px-6">
    <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="p-5 md:p-8 rounded-xl md:rounded-2xl border border-border/40 bg-card">
          <Pulse className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl mx-auto mb-3" />
          <Pulse className="w-24 h-4 mx-auto mb-1" />
          <Pulse className="w-16 h-3 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

export const AdminCardSkeleton = () => (
  <div className="space-y-2.5">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card">
        <Pulse className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Pulse className="w-40 h-4" />
          <Pulse className="w-24 h-3" />
        </div>
        <Pulse className="w-7 h-7 rounded-lg" />
      </div>
    ))}
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-border/40 bg-card">
          <Pulse className="w-16 h-3 mb-2" />
          <Pulse className="w-12 h-7" />
        </div>
      ))}
    </div>
    <div className="p-4 rounded-xl border border-border/40 bg-card">
      <Pulse className="w-32 h-5 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <Pulse className="w-8 h-4" />
          <Pulse className="flex-1 h-4" />
          <Pulse className="w-12 h-4" />
        </div>
      ))}
    </div>
  </div>
);
