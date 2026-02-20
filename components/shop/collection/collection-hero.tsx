interface CollectionHeroProps {
  description: string | null;
}

export function CollectionHero({ description }: CollectionHeroProps) {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-0 left-1/4 w-px h-full bg-slate-900" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-slate-900" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-slate-900" />
      </div>

      {/* Large faded watermark text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[20vw] font-light text-slate-100 tracking-tighter whitespace-nowrap">
          EDIT
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8">
        <div className="py-20 md:py-28 lg:py-36">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-slate-500 font-medium mb-6 md:mb-8">
              Curated Stories
            </p>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-slate-900 mb-6 md:mb-8">
              The Collection
            </h1>

            {/* Subhead */}
            <p className="text-lg md:text-xl lg:text-2xl text-slate-600 font-light max-w-xl leading-relaxed">
              Every piece has a story. Discover yours.
            </p>

            {/* Decorative line */}
            <div className="mt-10 md:mt-12 flex items-center gap-4">
              <div className="h-px w-16 bg-slate-300" />
              <span className="text-xs text-slate-400 uppercase tracking-widest">
                {description || "Handpicked selections"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-100" />
    </section>
  );
}
