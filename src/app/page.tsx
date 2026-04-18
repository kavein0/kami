import { getPopularTitles } from "@/lib/tmdb";
import { getPopularAnime, fetchKitsuCover, enrichDetailWithRussian } from "@/lib/jikan";
import { HeroBanner } from "@/components/hero-banner";
import { TitleSection } from "@/components/title-section";
import { Flame, TrendingUp, Clapperboard, Sparkles } from "lucide-react";
import { getDictionary, getLanguage } from "@/lib/i18n";
import { ANIME_GENRES } from "@/lib/types";
import { ClientPageTransition } from "@/components/client-page-transition";
import { auth } from "@/lib/auth";
import { getActivityFeedTitles } from "@/lib/recommendations";

export default async function HomePage() {
  const session = await auth();
  const lang = await getLanguage();

  const utcNow = new Date();
  const daysSinceEpoch = Math.floor(utcNow.getTime() / (1000 * 60 * 60 * 24));
  const heroPage = (daysSinceEpoch % 10) + 1;

  // Run all independent fetch requests in parallel for massive performance boost
  const [
    activityTitles,
    { results: topAnime },
    { results: topMovies },
    { results: topSeries },
    dict,
    { results: heroPoolAnime },
    { results: heroPoolMovies },
    { results: heroPoolSeries }
  ] = await Promise.all([
    getActivityFeedTitles(session?.user?.id),
    getPopularAnime({ sortBy: "score", page: 1 }),
    getPopularTitles("movie", { sortBy: "vote_average.desc", page: 1 }),
    getPopularTitles("tv", { sortBy: "vote_average.desc", filterAnime: false, page: 1 }),
    getDictionary(),
    getPopularAnime({ sortBy: "score", page: heroPage }),
    getPopularTitles("movie", { sortBy: "vote_average.desc", page: heroPage, language: "en" }),
    getPopularTitles("tv", { sortBy: "vote_average.desc", filterAnime: false, page: heroPage, language: "en" })
  ]);

  // Combine top-rated anime, movies, and series of the randomized page for the daily hero pool
  const mixedHeroPool = [
    ...heroPoolAnime.slice(0, 5), 
    ...heroPoolMovies.slice(0, 5), 
    ...heroPoolSeries.slice(0, 5)
  ];

  // Pick an index within that page based on the day
  const heroIndex = daysSinceEpoch % Math.max(mixedHeroPool.length, 1);
  let heroTitle = mixedHeroPool[heroIndex] || topAnime[0];

  // If the selected hero is an anime, enrich it with a high-res Kitsu cover image (3360x800)
  if (heroTitle && heroTitle.type === "anime") {
    const [kitsuCover, enrichedHeroTitle] = await Promise.all([
      fetchKitsuCover(heroTitle.nameEn || heroTitle.name),
      enrichDetailWithRussian(heroTitle)
    ]);
    
    heroTitle = enrichedHeroTitle;
    if (kitsuCover) {
      heroTitle = { ...heroTitle, backdrop: kitsuCover };
    }
  } else if (heroTitle && (heroTitle.type === "movie" || heroTitle.type === "series")) {
    // If it's a movie/series and we're in RU mode, fetch localized details for the specific ID
    if (lang === "ru") {
      const { getTitleDetail } = await import("@/lib/tmdb");
      const localizedTitle = await getTitleDetail(heroTitle.id);
      if (localizedTitle) {
        heroTitle = localizedTitle;
      }
    }
  }

  return (
    <ClientPageTransition>
      <div className="min-h-screen">
        {/* Hero Section */}
        {heroTitle && <HeroBanner title={heroTitle} />}

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 space-y-8">
        
        <TitleSection
          title={dict.feed.title || "For You"}
          icon={<Sparkles className="w-6 h-6 text-neon-cyan animate-pulse-neon" />}
          titles={activityTitles.slice(0, 20)}
        />
        <TitleSection
          title={dict.home.popularAnime}
          icon={<Flame className="w-6 h-6 text-neon-pink" />}
          titles={topAnime.slice(0, 20)}
          href="/browse?tab=anime&sort=rating_desc"
        />

        <TitleSection
          title={dict.home.topMovies}
          icon={<Clapperboard className="w-6 h-6 text-neon-yellow" />}
          titles={topMovies.slice(0, 20)}
          href="/browse?tab=movie&sort=rating_desc"
        />

        <TitleSection
          title={dict.home.topSeries}
          icon={<TrendingUp className="w-6 h-6 text-neon-green" />}
          titles={topSeries.slice(0, 20)}
          href="/browse?tab=series&sort=rating_desc"
        />

        {/* Genre chips section */}
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-neon-cyan to-neon-pink" />
            {dict.home.genresTarget}
          </h2>
          <div className="flex flex-wrap gap-3">
            {ANIME_GENRES.slice(0, 10).map((g) => {
              const localized = (dict.genres as Record<string, string>)[g.name] || g.name;
              return (
                <a
                  key={g.name}
                  href={`/browse?tab=anime&genre=${g.name}`}
                  className="px-5 py-2.5 rounded-2xl glass border border-dark-border text-dark-muted hover:text-neon-cyan hover:border-neon-cyan/30 transition-all duration-300 text-sm font-medium"
                >
                  {localized}
                </a>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-dark-border py-8 text-center mt-20 relative z-10 glass-strong rounded-t-3xl border-b-0">
          <p className="text-dark-muted text-sm tracking-wide">
            © {new Date().getFullYear()} <span className="text-neon-cyan font-semibold font-heading tracking-wider">MiruVerse</span>. {dict.home.footerRights}
          </p>
          <p className="text-dark-muted/50 text-xs mt-2 uppercase tracking-widest font-semibold">
            {dict.home.footerNote}
          </p>
        </footer>
      </div>
      </div>
    </ClientPageTransition>
  );
}
