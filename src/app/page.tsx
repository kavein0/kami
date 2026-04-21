import { getPopularTitles } from "@/lib/tmdb";
import { getPopularAnime, fetchKitsuCover, enrichDetailWithRussian } from "@/lib/jikan";
import { HeroBanner } from "@/components/hero-banner";
import { TitleSection } from "@/components/title-section";
import { Flame, TrendingUp, Clapperboard, Sparkles } from "lucide-react";
import { getDictionary, getLanguage } from "@/lib/i18n";
import { ANIME_GENRES } from "@/lib/types";
import { ClientPageTransition } from "@/components/client-page-transition";
import { auth } from "@/lib/auth";
import { HomeGenreSection, AnimatedFooter } from "@/components/home-genre-section";
import { getActivityFeedTitles } from "@/lib/recommendations";
import { ScrollReveal } from "@/components/scroll-reveal";

export default async function HomePage() {
  const session = await auth();
  const lang = await getLanguage();

  const utcNow = new Date();
  const daysSinceEpoch = Math.floor(utcNow.getTime() / (1000 * 60 * 60 * 24));
  const heroPage = (daysSinceEpoch % 10) + 1;

  const [
    activityTitles,
    { results: topAnime },
    { results: topMovies },
    { results: topSeries },
    dict,
    { results: heroPoolAnime },
    { results: heroPoolMovies },
    { results: heroPoolSeries },
  ] = await Promise.all([
    getActivityFeedTitles(session?.user?.id),
    getPopularAnime({ sortBy: "score", page: 1 }),
    getPopularTitles("movie", { sortBy: "vote_average.desc", page: 1 }),
    getPopularTitles("tv", { sortBy: "vote_average.desc", filterAnime: false, page: 1 }),
    getDictionary(),
    getPopularAnime({ sortBy: "score", page: heroPage }),
    getPopularTitles("movie", { sortBy: "vote_average.desc", page: heroPage, language: "en" }),
    getPopularTitles("tv", { sortBy: "vote_average.desc", filterAnime: false, page: heroPage, language: "en" }),
  ]);

  const mixedHeroPool = [
    ...heroPoolAnime.slice(0, 5),
    ...heroPoolMovies.slice(0, 5),
    ...heroPoolSeries.slice(0, 5),
  ];

  const heroIndex = daysSinceEpoch % Math.max(mixedHeroPool.length, 1);
  let heroTitle = mixedHeroPool[heroIndex] || topAnime[0];

  if (heroTitle && heroTitle.type === "anime") {
    const [kitsuCover, enrichedHeroTitle] = await Promise.all([
      fetchKitsuCover(heroTitle.nameEn || heroTitle.name),
      enrichDetailWithRussian(heroTitle),
    ]);
    heroTitle = enrichedHeroTitle;
    if (kitsuCover) heroTitle = { ...heroTitle, backdrop: kitsuCover };
  } else if (heroTitle && (heroTitle.type === "movie" || heroTitle.type === "series")) {
    if (lang === "ru") {
      const { getTitleDetail } = await import("@/lib/tmdb");
      const localizedTitle = await getTitleDetail(heroTitle.id);
      if (localizedTitle) heroTitle = localizedTitle;
    }
  }

  const genreList = ANIME_GENRES.slice(0, 14).map((g) => ({
    name: g.name,
    localized: (dict.genres as Record<string, string>)[g.name] || g.name,
  }));

  return (
    <ClientPageTransition>
      <div className="min-h-screen">
        {heroTitle && <HeroBanner title={heroTitle} />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 space-y-4">
          <ScrollReveal>
            <TitleSection
              title={dict.feed.title || "For You"}
              icon={<Sparkles className="w-6 h-6 text-neon-cyan animate-pulse-neon" />}
              titles={activityTitles.slice(0, 20)}
            />
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <TitleSection
              title={dict.home.popularAnime}
              icon={<Flame className="w-6 h-6 text-neon-pink" />}
              titles={topAnime.slice(0, 20)}
              href="/browse?tab=anime&sort=rating_desc"
            />
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <TitleSection
              title={dict.home.topMovies}
              icon={<Clapperboard className="w-6 h-6 text-neon-yellow" />}
              titles={topMovies.slice(0, 20)}
              href="/browse?tab=movie&sort=rating_desc"
            />
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <TitleSection
              title={dict.home.topSeries}
              icon={<TrendingUp className="w-6 h-6 text-neon-green" />}
              titles={topSeries.slice(0, 20)}
              href="/browse?tab=series&sort=rating_desc"
            />
          </ScrollReveal>

          <ScrollReveal>
            <HomeGenreSection title={dict.home.genresTarget} genres={genreList} />
          </ScrollReveal>

          <AnimatedFooter
            year={new Date().getFullYear()}
            rights={dict.home.footerRights}
            note={dict.home.footerNote}
          />
        </div>
      </div>
    </ClientPageTransition>
  );
}
