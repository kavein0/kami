"use server";

import { searchTitles, getPopularTitles } from "@/lib/tmdb";
import { ANIME_GENRES, MOVIE_GENRES, SERIES_GENRES, TitleData } from "@/lib/types";
import { getPopularAnime, searchAnime } from "@/lib/jikan";
import { z } from "zod";

type AnimeSortBy = NonNullable<Parameters<typeof getPopularAnime>[0]>["sortBy"];

const loadMoreSchema = z.object({
  page: z.number().int().min(1),
  q: z.string().optional(),
  tab: z.string().optional(),
  genre: z.string().optional(),
  year: z.string().optional(),
  sort: z.string().optional(),
});

export async function loadMoreTitles(params: {
  page: number;
  q?: string;
  tab?: string;
  genre?: string;
  year?: string;
  sort?: string;
}) {
  const parsed = loadMoreSchema.safeParse(params);
  if (!parsed.success) return [];

  const { page, q, tab, genre, year, sort } = parsed.data;
  let titles: TitleData[] = [];

  if (q) {
    if (tab === "anime") {
      const res = await searchAnime(q, page);
      titles = res.results;
    } else {
      const res = await searchTitles(q, page);
      titles = res.results;
      if (tab === "movie") titles = titles.filter(t => t.type === "movie");
      if (tab === "series") titles = titles.filter(t => t.type === "series");
    }
  } else {
    // Determine fetch parameters based on tab selection
    if (tab === "anime") {
        let genreIds;
        if (genre) {
          const ids = genre.split(",").map(n => ANIME_GENRES.find(g => g.name === n?.trim())?.id).filter(Boolean);
          if (ids.length > 0) genreIds = ids.join(",");
        }
        
        let sortMal: AnimeSortBy = "members";
        if (sort === "rating_desc") sortMal = "score";
        if (sort === "date_asc") sortMal = "start_date";
        if (sort === "date_desc") sortMal = "start_date";
        
        const sortDir = sort === "date_asc" ? "asc" : "desc";
        
        const res = await getPopularAnime({
            page,
            genreId: genreIds,
            sortBy: sortMal,
            sort: sortDir
        });
        titles = res.results;
    } else {
        let genreConfig: { id: string | number; type: string } | undefined;
        const fetchType: "tv" | "movie" = tab === "series" ? "tv" : "movie";

        if (tab === "series" && genre) {
          const ids = genre.split(",").map(n => SERIES_GENRES.find(g => g.name === n?.trim())?.id).filter(Boolean);
          if (ids.length > 0) genreConfig = { id: ids.join("|"), type: "genre" };
        } else if (tab === "movie" && genre) {
          const ids = genre.split(",").map(n => MOVIE_GENRES.find(g => g.name === n?.trim())?.id).filter(Boolean);
          if (ids.length > 0) genreConfig = { id: ids.join("|"), type: "genre" };
        }

        const sortConfig = 
          sort === "rating_desc" ? "vote_average.desc" : 
          sort === "date_desc" ? (fetchType === "tv" ? "first_air_date.desc" : "primary_release_date.desc") : 
          sort === "date_asc" ? (fetchType === "tv" ? "first_air_date.asc" : "primary_release_date.asc") :
          "popularity.desc";

        const res = await getPopularTitles(fetchType, {
            filterAnime: false,
            page,
            genreId: genreConfig?.type === "genre" ? genreConfig.id : undefined,
            keywordId: genreConfig?.type === "keyword" ? genreConfig.id : undefined,
            sortBy: sortConfig as "popularity.desc" | "vote_average.desc" | "primary_release_date.desc" | "first_air_date.desc" | "primary_release_date.asc" | "first_air_date.asc"
        });
        titles = res.results;
    }
  }

  if (year) {
    titles = titles.filter(t => t.year === parseInt(year));
  }

  return titles;
}
