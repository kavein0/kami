import { TitleData } from "./types";
import { prisma } from "./prisma";
import { getLanguage } from "./i18n";

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

// ==================== KITSU (High-Res Cover Images) ====================

/**
 * Fetch a high-resolution cover image from Kitsu API for hero banners.
 * Returns a wide cover image (3360x800 at "large" size) instead of tiny MAL posters.
 */
export async function fetchKitsuCover(animeName: string): Promise<string | null> {
  try {
    const url = `https://kitsu.app/api/edge/anime?filter[text]=${encodeURIComponent(animeName)}&page[limit]=1&fields[anime]=coverImage`;
    const res = await fetch(url, {
      next: { revalidate: 86400 } // 24h cache
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    
    const cover = data?.data?.[0]?.attributes?.coverImage;
    if (!cover) return null;
    
    // Prefer large (3360x800), fallback to small (1680x400), then original
    return cover.large || cover.small || cover.original || null;
  } catch {
    return null;
  }
}

// ==================== SHIKIMORI (Russian Localization) ====================

const SHIKIMORI_BASE = "https://shikimori.one";

/**
 * Strip Shikimori's BBCode markup from descriptions.
 * e.g. [[character]] links, [b]bold[/b], etc.
 */
function stripBBCode(text: string): string {
  if (!text) return "";
  return text
    .replace(/\[\[([^\]]*?)\]\]/g, "$1") // [[character]] links — keep the name text
    .replace(/\[([a-z_]+?)(?:=[^\]]+?)?\]([\s\S]*?)\[\/\1\]/g, "$2") // [b]text[/b], [url=...]text[/url]
    .replace(/\[([a-z_]+?)(?:=[^\]]+?)?\]/g, "") // standalone [tag]
    .replace(/\[\/[a-z_]+?\]/g, "") // standalone [/tag]
    .trim();
}

/**
 * Batch-fetch Russian names and descriptions from Shikimori.
 * Uses the batch endpoint: GET /api/animes?ids=1,2,3&limit=50
 */
async function fetchShikimoriRussian(malIds: number[]): Promise<Map<number, { russian: string; description: string }>> {
  const map = new Map<number, { russian: string; description: string }>();
  if (malIds.length === 0) return map;

  try {
    const url = `${SHIKIMORI_BASE}/api/animes?ids=${malIds.join(",")}&limit=50`;
    const res = await fetch(url, {
      headers: { "User-Agent": "MiruVerse/1.0" },
      next: { revalidate: 86400 } // 24h cache
    });

    if (!res.ok) return map;
    const data = await res.json();

    for (const item of data) {
      map.set(item.id, {
        russian: item.russian || "",
        description: "", // batch endpoint doesn't return description
      });
    }
  } catch (err) {
    console.error("Shikimori batch fetch error:", err);
  }

  return map;
}

/**
 * Fetch detailed Russian description for a single anime from Shikimori.
 */
async function fetchShikimoriDetail(malId: number): Promise<{ russian: string; description: string } | null> {
  try {
    const url = `${SHIKIMORI_BASE}/api/animes/${malId}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "MiruVerse/1.0" },
      next: { revalidate: 86400 }
    });

    if (!res.ok) return null;
    const data = await res.json();

    return {
      russian: data.russian || "",
      description: data.description ? stripBBCode(data.description) : "",
    };
  } catch {
    return null;
  }
}

/**
 * Enrich an array of TitleData with Russian names from Shikimori.
 * Only runs when language is "ru".
 */
async function enrichWithRussian(titles: TitleData[]): Promise<TitleData[]> {
  const lang = await getLanguage();
  if (lang !== "ru") return titles;

  const malIds = titles
    .map(t => parseInt(t.id.replace("jikan_", "")))
    .filter(id => !isNaN(id));

  if (malIds.length === 0) return titles;

  const russianMap = await fetchShikimoriRussian(malIds);

  return titles.map(title => {
    const malId = parseInt(title.id.replace("jikan_", ""));
    const ruData = russianMap.get(malId);

    if (ruData && ruData.russian) {
      return {
        ...title,
        name: ruData.russian,
        // Keep nameEn as original English/Japanese name
      };
    }
    return title;
  });
}

/**
 * Enrich a single TitleData with Russian name AND description from Shikimori.
 * Used on detail pages where we want the full translated description.
 */
export async function enrichDetailWithRussian(title: TitleData): Promise<TitleData> {
  const lang = await getLanguage();
  if (lang !== "ru") return title;

  const malId = parseInt(title.id.replace("jikan_", ""));
  if (isNaN(malId)) return title;

  const ruData = await fetchShikimoriDetail(malId);
  if (!ruData) return title;

  return {
    ...title,
    name: ruData.russian || title.name,
    description: ruData.description || title.description,
  };
}

// ==================== JIKAN API ====================

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
    let results = (data.data || []).map((item: any) => normalizeJikanTitle(item));
    
    // Enrich with Russian names
    results = await enrichWithRussian(results);

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
    genreId?: number | string;
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
    let results = (data.data || []).map((item: any) => normalizeJikanTitle(item));
    results = await enrichWithRussian(results);
    
    return {
      results,
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
    let results = (data.data || []).map((item: any) => normalizeJikanTitle(item));
    results = await enrichWithRussian(results);
    
    return {
      results,
      totalResults: data.pagination?.items?.total || 0
    };
  }
}

/**
 * Get anime detail by MAL ID (with full Russian translation for detail pages)
 */
export async function getAnimeDetail(internalId: string): Promise<TitleData | null> {
  const malId = internalId.replace("jikan_", "").replace("anime_", ""); // Fallback cleanup
  
  const data = await fetchJikan(`/anime/${malId}/full`);
  if (!data || !data.data) {
     // If Jikan fails, maybe we have it in our cache DB 
     return prisma.title.findUnique({ where: { id: internalId } });
  }

  let title = normalizeJikanTitle(data.data);
  // For detail pages, fetch both Russian name AND description
  title = await enrichDetailWithRussian(title);
  
  return title;
}

/**
 * Get similar anime via recommendations endpoint
 */
export async function getSimilarAnime(internalId: string): Promise<TitleData[]> {
  const malId = internalId.replace("jikan_", "");
  
  const data = await fetchJikan(`/anime/${malId}/recommendations`);
  const recs = data.data || [];
  
  // Format is { entry: { mal_id, title... }, votes }
  let results = recs.slice(0, 12).map((item: any) => normalizeJikanTitle(item.entry));
  results = await enrichWithRussian(results);
  
  return results;
}
