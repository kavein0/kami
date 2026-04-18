export default function TitleLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Backdrop skeleton */}
      <div className="relative w-full h-[40vh] md:h-[60vh] bg-dark-card" />

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-24 sm:-mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0 mx-auto md:mx-0">
            <div className="w-48 sm:w-56 md:w-64 aspect-[2/3] rounded-2xl skeleton" />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 pt-4">
            <div className="h-4 w-24 rounded-full skeleton" />
            <div className="h-10 w-3/4 rounded-xl skeleton" />
            <div className="h-6 w-1/2 rounded-xl skeleton" />
            <div className="flex gap-3 flex-wrap">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-9 w-24 rounded-xl skeleton" />
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-7 w-20 rounded-full skeleton" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded skeleton" />
              <div className="h-4 w-5/6 rounded skeleton" />
              <div className="h-4 w-4/6 rounded skeleton" />
            </div>
            <div className="h-12 w-44 rounded-2xl skeleton" />
          </div>
        </div>

        {/* Similar titles skeleton */}
        <div className="mt-12">
          <div className="h-6 w-40 rounded skeleton mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl skeleton" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
