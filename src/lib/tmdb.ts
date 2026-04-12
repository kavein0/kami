/* eslint-disable @typescript-eslint/no-explicit-any */
import { TitleData } from "./types";
import { prisma } from "./prisma";
import { getLanguage } from "./i18n";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

class TMDBError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TMDBError";
  }
}

const TMDB_GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

/**
 * Normalizes TMDB format to our internal TitleData format
 */
function normalizeTMDBTitle(item: any, type: "movie" | "tv"): TitleData {
  const isMovie = type === "movie";
  const id = `${type}_${item.id}`;
  
  // Try to determine if it's anime by looking at original language or genres
  // TMDB genre 16 = Animation. 
  const isAnimation = item.genre_ids?.includes(16) || item.genres?.some((g: any) => g.id === 16);
  const isJapanese = item.original_language === "ja";
  const determinedType = isAnimation && isJapanese ? "anime" : isMovie ? "movie" : "series";

  return {
    id,
    name: isMovie ? item.title : item.name,
    nameEn: isMovie ? item.original_title : item.original_name,
    type: determinedType,
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null,
    backdrop: item.backdrop_path ? `${TMDB_BACKDROP_BASE}${item.backdrop_path}` : null,
    description: item.overview || null,
    trailer: null, // Fetched dynamically in detail view
    year: isMovie 
      ? (item.release_date ? parseInt(item.release_date.split("-")[0]) : null)
      : (item.first_air_date ? parseInt(item.first_air_date.split("-")[0]) : null),
    rating: item.vote_average || 0,
    episodes: item.number_of_episodes || null,
    duration: item.runtime ? `${item.runtime} min` : null,
    studio: item.networks?.[0]?.name || item.production_companies?.[0]?.name || null,
    genres: item.genres
      ? item.genres.map((g: any) => g.name).join(", ")
      : item.genre_ids
      ? item.genre_ids.map((id: number) => TMDB_GENRE_MAP[id]).filter(Boolean).join(", ")
      : "",
    status: item.status?.toLowerCase() || null,
    popularity: item.popularity || 0,
  };
}

export async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  if (!TMDB_API_KEY) {
    throw new TMDBError("TMDB_API_KEY is not set in environment variables");
  }

  const langCode = await getLanguage();
  const formatLang = langCode === "en" ? "en-US" : "ru-RU";

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", TMDB_API_KEY);
  url.searchParams.append("language", formatLang);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } }); // 1 hour cache
  if (!res.ok) {
    throw new TMDBError(`TMDB API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Search TMDB for multi (movies + tv shows)
 */
export async function searchTitles(query: string, page = 1): Promise<{ results: TitleData[], totalResults: number }> {
  if (!TMDB_API_KEY) {
    // Fallback to local DB search
    const localRes = await prisma.title.findMany({
      where: { name: { contains: query } },
      take: 20
    });
    return { results: localRes, totalResults: localRes.length };
  }

  const data = await fetchTMDB("/search/multi", { query, page: page.toString() });
  const results = data.results
    .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
    .map((item: any) => normalizeTMDBTitle(item, item.media_type));

  return { results, totalResults: data.total_results || results.length };
}

/**
 * Get trending or popular titles
 */
export async function getPopularTitles(
  type: "movie" | "tv",
  options: {
    filterAnime?: boolean;
    page?: number;
    genreId?: number;
    keywordId?: number;
    sortBy?: "popularity.desc" | "vote_average.desc" | "primary_release_date.desc" | "first_air_date.desc";
  } = {}
): Promise<{ results: TitleData[], totalResults: number }> {
  const { filterAnime = false, page = 1, genreId, keywordId, sortBy = "popularity.desc" } = options;

  if (!TMDB_API_KEY) {
    const localRes = await prisma.title.findMany({
      where: filterAnime ? { type: "anime" } : type === "movie" ? { type: "movie" } : {},
      take: 20,
      orderBy: { rating: "desc" }
    });
    return { results: localRes, totalResults: localRes.length };
  }

  const params: Record<string, string> = {
    page: page.toString()
  };
  
  let combinedGenres = "";
  if (filterAnime && type === "tv") {
    params["with_original_language"] = "ja";
    combinedGenres = "16"; // Base animation genre required
  } else if (!filterAnime && type === "tv") {
    // Exclude animation and Japanese origin completely to ensure Western/Live-action series only
    params["without_genres"] = "16";
  }

  if (genreId) {
    combinedGenres = combinedGenres ? `${combinedGenres},${genreId}` : genreId.toString();
  }
  
  if (combinedGenres) {
    params["with_genres"] = combinedGenres;
  }

  if (keywordId) {
    params["with_keywords"] = keywordId.toString();
  }

  if (sortBy === "vote_average.desc") {
    params["vote_count.gte"] = "1000";
  }

  const data = await fetchTMDB(`/discover/${type}`, {
    sort_by: sortBy,
    ...params
  });

  return {
    results: data.results.map((item: any) => normalizeTMDBTitle(item, type)),
    totalResults: data.total_results || 0
  };
}

/**
 * Get full detail for a title by TMDB ID
 */
export async function getTitleDetail(internalId: string): Promise<TitleData | null> {
  // If it's a legacy CUID (from initial seed), fetch from local DB
  if (!internalId.includes("_")) {
    return prisma.title.findUnique({ where: { id: internalId } });
  }

  if (!TMDB_API_KEY) {
    return prisma.title.findUnique({ where: { id: internalId } });
  }

  const [type, tmdbId] = internalId.split("_");
  if (type !== "movie" && type !== "tv") return null;

  try {
    const data = await fetchTMDB(`/${type}/${tmdbId}`, {
      append_to_response: "videos,similar"
    });

    const normalized = normalizeTMDBTitle(data, type as "movie" | "tv");
    
    // Find YouTube trailer
    const trailer = data.videos?.results?.find(
      (v: any) => v.site === "YouTube" && (v.type === "Trailer")
    );
    if (trailer) {
      normalized.trailer = `https://www.youtube.com/watch?v=${trailer.key}`;
    }

    return normalized;
  } catch (error) {
    console.error("Failed to fetch title detail", error);
    return null;
  }
}

/**
 * Get similar titles
 */
export async function getSimilarTitles(internalId: string): Promise<TitleData[]> {
  if (!internalId.includes("_") || !TMDB_API_KEY) {
    return [];
  }

  const [type, tmdbId] = internalId.split("_");
  try {
    const data = await fetchTMDB(`/${type}/${tmdbId}/similar`);
    return data.results.slice(0, 12).map((item: any) => normalizeTMDBTitle(item, type as "movie" | "tv"));
  } catch {
    return [];
  }
}
