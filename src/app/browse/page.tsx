import { searchTitles, getPopularTitles } from "@/lib/tmdb";
import { getPopularAnime, searchAnime } from "@/lib/jikan";
import { SearchBar } from "@/components/search-bar";
import { Suspense } from "react";
import { InfiniteScrollGrid } from "@/components/infinite-scroll-grid";
import { ANIME_GENRES, MOVIE_GENRES, SERIES_GENRES, GenreConfig } from "@/lib/types";
import { DropdownFilter } from "@/components/dropdown-filter";
import Link from "next/link";
import { GenreTooltip } from "@/components/genre-tooltip";
import { getDictionary } from "@/lib/i18n";

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    tab?: string;
    genre?: string;
    year?: string;
    sort?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const { q, genre, year, sort } = params;
  let tab = params.tab;
  const dict = await getDictionary();

  // Set default tab to anime ONLY if we are not searching
  if (!tab && !q) {
    tab = "anime";
  }

  let titles = [];
  let totalResults = 0;

  if (q) {
    if (tab === "anime") {
      const res = await searchAnime(q);
      titles = res.results;
      totalResults = res.totalResults;
    } else {
      const res = await searchTitles(q);
      titles = res.results;
      totalResults = res.totalResults;
      if (!tab && titles.length > 0) {
        tab = titles[0].type === "series" ? "series" : titles[0].type === "movie" ? "movie" : "anime";
      } else if (!tab) {
        tab = "anime";
      }
      if (tab === "movie") titles = titles.filter(t => t.type === "movie");
      if (tab === "series") titles = titles.filter(t => t.type === "series");
    }
  } else {
    if (tab === "anime") {
        let genreIds;
        if (genre) {
          const names = genre.split(",");
          const ids = names.map(n => ANIME_GENRES.find(g => g.name === n?.trim())?.id).filter(Boolean);
          if (ids.length > 0) genreIds = ids.join(",");
        }
        
        const sortMal = sort === "rating_desc" ? "score" : "members";
        
        const res = await getPopularAnime({
            page: 1,
            genreId: genreIds as any,
            sortBy: sortMal,
        });
        titles = res.results;
        totalResults = res.totalResults;
    } else {
        let genreConfig: GenreConfig | undefined;
        let fetchType: "tv" | "movie" = tab === "series" ? "tv" : "movie";

        if (tab === "series" && genre) {
          const names = genre.split(",");
          const ids = names.map(n => SERIES_GENRES.find(g => g.name === n?.trim())?.id).filter(Boolean);
          if (ids.length > 0) genreConfig = { id: ids.join("|"), name: genre, type: "genre" };
        } else if (tab === "movie" && genre) {
          const names = genre.split(",");
          const ids = names.map(n => MOVIE_GENRES.find(g => g.name === n?.trim())?.id).filter(Boolean);
          if (ids.length > 0) genreConfig = { id: ids.join("|"), name: genre, type: "genre" };
        }

        const sortConfig = 
          sort === "rating_desc" ? "vote_average.desc" : 
          sort === "date_desc" ? (fetchType === "tv" ? "first_air_date.desc" : "primary_release_date.desc") : 
          "popularity.desc";

        const res = await getPopularTitles(fetchType, {
            filterAnime: false,
            page: 1,
            genreId: genreConfig?.type === "genre" ? genreConfig.id : undefined,
            keywordId: genreConfig?.type === "keyword" ? genreConfig.id : undefined,
            sortBy: sortConfig
        });
        titles = res.results;
        totalResults = res.totalResults;
    }
  }

  // Client-side quick filter for remaining params
  if (year) {
    titles = titles.filter((t) => t.year === parseInt(year));
  }
  
  const hasFilters = q || tab || genre || year;

  const tabs = [
    { id: "anime", label: dict.browse.tabAnime, genres: ANIME_GENRES },
    { id: "movie", label: dict.browse.tabMovies, genres: MOVIE_GENRES },
    { id: "series", label: dict.browse.tabSeries, genres: SERIES_GENRES },
  ];

  const currentTabObj = tabs.find((t) => t.id === tab) || tabs[0];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
              {dict.browse.title}
            </span>
          </h1>
          <p className="text-dark-muted">
            {dict.browse.subtitle}
          </p>
        </div>

        {/* Search */}
        <Suspense fallback={<div className="h-14 skeleton rounded-2xl" />}>
          <SearchBar />
        </Suspense>

        {/* TABS & GENRES */}
        {!q && (
          <div className="mt-8 mb-8">
            <div className="flex overflow-x-auto hide-scrollbar border-b border-dark-border mb-6">
              {tabs.map((t) => (
                <Link
                  key={t.id}
                  href={`/browse?tab=${t.id}`}
                  className={`py-3 px-6 font-semibold whitespace-nowrap transition-colors duration-300 relative ${
                    tab === t.id ? "text-neon-cyan" : "text-dark-muted hover:text-dark-text"
                  }`}
                >
                  {t.label}
                  {tab === t.id && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 items-center mt-2">
              <DropdownFilter
                label={dict.browse.filtersGenre}
                paramKey="genre"
                currentValue={genre || ""}
                defaultLabel={dict.browse.filterAny}
                multiSelect={true}
                options={currentTabObj.genres.map((g) => ({
                  label: g.name,
                  value: g.name,
                }))}
              />
              
              <DropdownFilter
                label={dict.browse.filtersSort}
                paramKey="sort"
                currentValue={sort || ""}
                defaultLabel={dict.browse.sortPopularity}
                options={[
                  { label: dict.browse.sortRating, value: "rating_desc" },
                  { label: dict.browse.sortDate, value: "date_desc" },
                ]}
              />
            </div>
          </div>
        )}

        {hasFilters && (
          <div className="mt-6 mb-4 flex items-center justify-between flex-wrap gap-4">
            <p className="text-dark-muted text-sm">
              {dict.browse.foundPrefix} <span className="text-neon-cyan font-semibold">{totalResults}</span> {dict.browse.resultsSuffix}
              {q && (
                <span>
                  {" "}{dict.browse.queryFor} «<span className="text-dark-text">{q}</span>»
                </span>
              )}
            </p>
          </div>
        )}

        <InfiniteScrollGrid initialTitles={titles} q={q} tab={tab} genre={genre} year={year} sort={sort} />
      </div>
    </div>
  );
}
