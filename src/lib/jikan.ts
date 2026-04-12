import { TitleData } from "./types";
import { prisma } from "./prisma";

// Rate limiting state for Jikan (since it doesn't require API keys but aggressively limits)
// Jikan limits: 3 requests per second, 60 requests per minute
let lastRequestTime = 0;

async function waitRateLimit() {
  const now = Date.now();
  const diff = now - lastRequestTime;
  if (diff < 350) { // 350ms buffer (~2.8 requests per second max)
    await new Promise(resolve => setTimeout(resolve, 350 - diff));
  }
  lastRequestTime = Date.now();
}

/**
 * Normalizes Jikan format to our internal TitleData format
 */
export function normalizeJikanTitle(item: any): TitleData {
  const id = `jikan_${item.mal_id}`;
  
  // Find backdrop - Try trailer maxres, otherwise large poster
  const backdrop = item.trailer?.images?.maximum_image_url 
    || item.trailer?.images?.large_image_url 
    || item.images?.webp?.large_image_url
    || item.images?.jpg?.large_image_url
    || null;

  // Poster: try webp first, then jpg fallback
  const poster = item.images?.webp?.large_image_url 
    || item.images?.jpg?.large_image_url 
    || item.images?.webp?.image_url 
    || item.images?.jpg?.image_url 
    || null;

  // Jikan splits taxonomy into genres, themes, and demographics.
  // We merge them all into a single genres string for display.
  const allGenres = [
    ...(item.genres || []),
    ...(item.themes || []),
    ...(item.demographics || []),
  ].map((g: any) => g.name);
  
  // Deduplicate
  const uniqueGenres = [...new Set(allGenres)];

  return {
    id,
    name: item.title,
    nameEn: item.title_english || item.title,
    type: "anime",
    poster,
    backdrop,
    description: item.synopsis || null,
    trailer: item.trailer?.url || null,
    year: item.year || (item.aired?.prop?.from?.year) || null,
    rating: item.score || 0,
    episodes: item.episodes || null,
    duration: item.duration ? item.duration.replace(" per ep", "") : null,
    studio: item.studios?.[0]?.name || null,
    genres: uniqueGenres.join(", "),
    status: item.status?.toLowerCase() || null,
    popularity: item.members || 0,
  };
}

export async function fetchJikan(endpoint: string, params: Record<string, string> = {}) {
  await waitRateLimit();
  
  const url = new URL(`https://api.jikan.moe/v4${endpoint}`);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  try {
    const res = await fetch(url.toString(), { 
      // Cache aggressively - Jikan recommends 24 hours for most read-only queries
      next: { revalidate: 86400 } 
    });
    
    if (!res.ok) {
      console.warn(`Jikan API warning: ${res.status} ${res.statusText}`);
      if (res.status === 429) {
         // Critical rate limit hit
         return { data: [] };
      }
      return { data: [] }; // Silent fallback to avoid crashing SSR
    }
    return await res.json();
  } catch (err) {
    console.error("Jikan API Error:", err);
    return { data: [] };
  }
}

/**
 * Search MyAnimeList titles natively via Jikan
 */
export async function searchAnime(query: string, page = 1): Promise<{ results: TitleData[], totalResults: number }> {
  try {
    const data = await fetchJikan("/anime", { q: query, page: page.toString(), limit: "15" });
    const results = (data.data || []).map((item: any) => normalizeJikanTitle(item));

    return { 
       results, 
       totalResults: data.pagination?.items?.total || results.length 
    };
  } catch (error) {
    return { results: [], totalResults: 0 };
  }
}

/**
 * Get Top Anime with optional genre filtering
 */
export async function getPopularAnime(
  options: {
    page?: number;
    genreId?: number;
    sortBy?: "score" | "members" | "favorites";
  } = {}
): Promise<{ results: TitleData[], totalResults: number }> {
  const { page = 1, genreId, sortBy = "members" } = options;

  const params: Record<string, string> = {
    page: page.toString(),
    limit: "24", // Fill the 6-column grid perfectly
  };
  
  if (genreId) {
    // If we have a genre filter, we must use /anime endpoint instead of /top/anime
    params["genres"] = genreId.toString();
    params["order_by"] = sortBy === "members" ? "members" : "score";
    params["sort"] = "desc";
    
    const data = await fetchJikan("/anime", params);
    return {
      results: (data.data || []).map((item: any) => normalizeJikanTitle(item)),
      totalResults: data.pagination?.items?.total || 0
    };
  } else {
    // Default Top Anime
    const endpoint = sortBy === "score" ? "/top/anime" : "/anime";
    
    if (sortBy === "members") {
        params["order_by"] = "members";
        params["sort"] = "desc";
    }

    const data = await fetchJikan(endpoint, params);
    return {
      results: (data.data || []).map((item: any) => normalizeJikanTitle(item)),
      totalResults: data.pagination?.items?.total || 0
    };
  }
}

/**
 * Get anime detail by MAL ID
 */
export async function getAnimeDetail(internalId: string): Promise<TitleData | null> {
  const malId = internalId.replace("jikan_", "").replace("anime_", ""); // Fallback cleanup
  
  const data = await fetchJikan(`/anime/${malId}/full`);
  if (!data || !data.data) {
     // If Jikan fails, maybe we have it in our cache DB 
     return prisma.title.findUnique({ where: { id: internalId } });
  }

  return normalizeJikanTitle(data.data);
}

/**
 * Get similar anime via recommendations endpoint
 */
export async function getSimilarAnime(internalId: string): Promise<TitleData[]> {
  const malId = internalId.replace("jikan_", "");
  
  const data = await fetchJikan(`/anime/${malId}/recommendations`);
  const recs = data.data || [];
  
  // Format is { entry: { mal_id, title... }, votes }
  return recs.slice(0, 12).map((item: any) => normalizeJikanTitle(item.entry));
}
