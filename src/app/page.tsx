import { getPopularTitles } from "@/lib/tmdb";
import { HeroBanner } from "@/components/hero-banner";
import { TitleSection } from "@/components/title-section";
import { Flame, TrendingUp, Clapperboard } from "lucide-react";
import { getDictionary } from "@/lib/i18n";

export default async function HomePage() {
  const { results: topAnime } = await getPopularTitles("tv", { filterAnime: true, sortBy: "vote_average.desc" });
  const { results: topMovies } = await getPopularTitles("movie", { sortBy: "vote_average.desc" });
  const { results: topSeries } = await getPopularTitles("tv", { sortBy: "vote_average.desc" });

  const dict = await getDictionary();

  // Pick hero title from popular anime
  const heroTitle = topAnime[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {heroTitle && <HeroBanner title={heroTitle} />}

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 space-y-4">
        <TitleSection
          title={dict.home.popularAnime}
          icon={<Flame className="w-6 h-6 text-neon-pink" />}
          titles={topAnime.slice(0, 6)}
          href="/browse?tab=anime&sort=rating_desc"
        />

        <TitleSection
          title={dict.home.topMovies}
          icon={<Clapperboard className="w-6 h-6 text-neon-yellow" />}
          titles={topMovies.slice(0, 6)}
          href="/browse?tab=movie&sort=rating_desc"
        />

        <TitleSection
          title={dict.home.topSeries}
          icon={<TrendingUp className="w-6 h-6 text-neon-green" />}
          titles={topSeries.slice(0, 6)}
          href="/browse?tab=series&sort=rating_desc"
        />

        {/* Genre chips section */}
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-neon-cyan to-neon-pink" />
            {dict.home.genresTarget}
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              "Экшен",
              "Драма",
              "Комедия",
              "Романтика",
              "Фэнтези",
              "Sci-Fi",
              "Триллер",
              "Приключения",
              "Психологическое",
              "Сверхъестественное",
            ].map((genre) => (
              <a
                key={genre}
                href={`/browse?tab=anime&genre=${genre}`}
                className="px-5 py-2.5 rounded-2xl glass border border-dark-border text-dark-muted hover:text-neon-cyan hover:border-neon-cyan/30 transition-all duration-300 text-sm font-medium"
              >
                {genre}
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-dark-border py-8 text-center">
          <p className="text-dark-muted text-sm">
            © {new Date().getFullYear()} <span className="text-neon-cyan font-semibold">KamiList</span>. {dict.home.footerRights}
          </p>
          <p className="text-dark-muted/50 text-xs mt-2">
            {dict.home.footerNote}
          </p>
        </footer>
      </div>
    </div>
  );
}
