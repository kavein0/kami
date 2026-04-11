import { getPopularTitles } from "@/lib/tmdb";
import { HeroBanner } from "@/components/hero-banner";
import { TitleSection } from "@/components/title-section";
import { Flame, TrendingUp, Clapperboard, Sparkles } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import { ClientPageTransition } from "@/components/client-page-transition";
import { auth } from "@/lib/auth";
import { getPersonalizedRecommendations } from "@/lib/recommendations";

export default async function HomePage() {
  const session = await auth();
  const recommended = await getPersonalizedRecommendations(session?.user?.id);

  const { results: topAnime } = await getPopularTitles("tv", { filterAnime: true, sortBy: "popularity.desc", page: 1 });
  const { results: topMovies } = await getPopularTitles("movie", { sortBy: "popularity.desc", page: 1 });
  const { results: topSeries } = await getPopularTitles("tv", { sortBy: "popularity.desc", filterAnime: false, page: 1 });

  const dict = await getDictionary();

  // Anime of the day logic (Changes randomly based on current day numerical value)
  const currentDaySeed = new Date().getDate() + new Date().getMonth();
  const randomIndex = currentDaySeed % Math.max(topAnime.length, 1);
  const heroTitle = topAnime[randomIndex] || topAnime[0];

  return (
    <ClientPageTransition>
      <div className="min-h-screen">
        {/* Hero Section */}
        {heroTitle && <HeroBanner title={heroTitle} />}

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 space-y-8">
        
        <TitleSection
          title={dict.feed.title || "For You"}
          icon={<Sparkles className="w-6 h-6 text-neon-cyan animate-pulse-neon" />}
          titles={recommended}
          href="/browse"
        />
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
        <footer className="border-t border-dark-border py-8 text-center mt-20 relative z-10 glass-strong rounded-t-3xl border-b-0">
          <p className="text-dark-muted text-sm tracking-wide">
            © {new Date().getFullYear()} <span className="text-neon-cyan font-semibold font-heading tracking-wider">KamiList</span>. {dict.home.footerRights}
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
