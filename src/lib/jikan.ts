import { TitleData } from "./types";
import { prisma } from "./prisma";
import { getLanguage } from "./i18n";

type JikanNamedItem = {
  name: string;
};

type JikanImageVariant = {
  image_url?: string | null;
  large_image_url?: string | null;
};

type JikanAnime = {
  mal_id: number;
  title: string;
  title_english?: string | null;
  trailer?: {
    url?: string | null;
    images?: {
      maximum_image_url?: string | null;
      large_image_url?: string | null;
    } | null;
  } | null;
  images?: {
    webp?: JikanImageVariant | null;
    jpg?: JikanImageVariant | null;
  } | null;
  synopsis?: string | null;
  aired?: {
    prop?: {
      from?: {
        year?: number | null;
      } | null;
    } | null;
  } | null;
  year?: number | null;
  score?: number | null;
  episodes?: number | null;
  duration?: string | null;
  studios?: JikanNamedItem[] | null;
  genres?: JikanNamedItem[] | null;
  themes?: JikanNamedItem[] | null;
  demographics?: JikanNamedItem[] | null;
  status?: string | null;
  members?: number | null;
};

type ShikimoriAnime = {
  id: number;
  myanimelist_id?: number | null;
  name: string;
  russian?: string | null;
  english?: string[] | null;
  japanese?: string[] | null;
  image?: {
    original?: string | null;
    preview?: string | null;
    x96?: string | null;
    x48?: string | null;
  } | null;
  kind?: string | null;
  score?: string | number | null;
  status?: string | null;
  episodes?: number | null;
  episodes_aired?: number | null;
  aired_on?: string | null;
  released_on?: string | null;
  duration?: number | string | null;
  genres?: Array<{
    id: number;
    name: string;
    russian?: string | null;
  }> | null;
  studios?: Array<{
    id?: number;
    name?: string | null;
    filtered_name?: string | null;
  }> | null;
  description?: string | null;
  screenshots?: Array<{
    original?: string | null;
  }> | null;
  videos?: Array<{
    url?: string | null;
    player_url?: string | null;
    kind?: string | null;
  }> | null;
};

type JikanRecommendation = {
  entry: JikanAnime;
};

type JikanResponse<T> = {
  data?: T;
  pagination?: {
    items?: {
      total?: number;
    };
  };
};

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
export function normalizeJikanTitle(item: JikanAnime): TitleData {
  const id = `jikan_${item.mal_id}`;
  
  // Find backdrop - Try trailer maxres or large
  const backdrop = item.trailer?.images?.maximum_image_url 
    || item.trailer?.images?.large_image_url 
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
  ].map((genre) => genre.name);
  
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
    const data = await res.json() as { data?: Array<{ attributes?: { coverImage?: { large?: string | null; small?: string | null; original?: string | null } | null } | null }> };
    
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

function toAbsoluteShikimoriUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/assets/globals/missing")) return null;
  return `${SHIKIMORI_BASE}${path}`;
}

function normalizeShikimoriStatus(status?: string | null): string | null {
  if (!status) return null;
  if (status === "released") return "finished";
  if (status === "ongoing") return "airing";
  if (status === "anons") return "upcoming";
  return status;
}

function extractYearFromDate(date?: string | null): number | null {
  if (!date) return null;
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

/**
 * Fetch a more accurate total count from Kitsu API when Jikan is down.
 */
async function fetchKitsuTotalCount(options: { search?: string, genre?: string } = {}): Promise<number | null> {
  const { search, genre } = options;
  let url = "https://kitsu.io/api/edge/anime?page[limit]=1";
  
  if (search) {
    url += `&filter[text]=${encodeURIComponent(search)}`;
  }
  
  // Note: Kitsu genres (categories) might not match Shikimori perfectly, 
  // but it's better than a static number.
  if (genre) {
    url += `&filter[categories]=${encodeURIComponent(genre)}`;
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "MiruVerse/1.0", "Accept": "application/vnd.api+json" },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.meta?.count || null;
  } catch (error) {
    console.error("Kitsu Count Error:", error);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeShikimoriGraphQLTitle(item: any, lang: "ru" | "en"): TitleData {
  const malId = item.myanimelist_id ?? parseInt(item.id);
  const poster =
    toAbsoluteShikimoriUrl(item.poster?.originalUrl) ??
    toAbsoluteShikimoriUrl(item.image?.original);
  
  const backdrop = toAbsoluteShikimoriUrl(item.screenshots?.[0]?.originalUrl) ?? null;
  const score = item.score ? parseFloat(item.score.toString()) : 0;

  return {
    id: `jikan_${malId}`,
    name: lang === "ru" && item.russian ? item.russian : item.name,
    nameEn: item.english || item.name || null,
    type: "anime",
    poster,
    backdrop,
    description: item.description ? stripBBCode(item.description) : null,
    trailer: null,
    year: extractYearFromDate(item.airedOn?.date || item.releasedOn?.date),
    rating: Number.isFinite(score) ? score : 0,
    episodes: item.episodes || null,
    duration: item.duration ? `${item.duration} min` : null,
    studio: item.studios?.[0]?.name || null,
    genres: (item.genres || []).map((genre: { name: string }) => genre.name).join(", "),
    status: normalizeShikimoriStatus(item.status),
    popularity: 0,
  };
}

function normalizeShikimoriTitle(item: ShikimoriAnime, lang: "ru" | "en"): TitleData {
  const malId = item.myanimelist_id ?? item.id;
  const poster =
    toAbsoluteShikimoriUrl(item.image?.original) ??
    toAbsoluteShikimoriUrl(item.image?.preview) ??
    toAbsoluteShikimoriUrl(item.image?.x96);
  const backdrop = toAbsoluteShikimoriUrl(item.screenshots?.[0]?.original) ?? null;
  const score =
    typeof item.score === "number"
      ? item.score
      : item.score
      ? Number.parseFloat(item.score)
      : 0;

  const duration =
    typeof item.duration === "number"
      ? `${item.duration} min`
      : item.duration || null;

  return {
    id: `jikan_${malId}`,
    name: lang === "ru" && item.russian ? item.russian : item.name,
    nameEn: item.english?.[0] || item.name || null,
    type: "anime",
    poster,
    backdrop,
    description: item.description ? stripBBCode(item.description) : null,
    trailer: item.videos?.[0]?.player_url || item.videos?.[0]?.url || null,
    year: extractYearFromDate(item.aired_on || item.released_on),
    rating: Number.isFinite(score) ? score : 0,
    episodes: item.episodes || null,
    duration,
    studio: item.studios?.[0]?.filtered_name || item.studios?.[0]?.name || null,
    genres: (item.genres || []).map((genre) => genre.name).join(", "),
    status: normalizeShikimoriStatus(item.status),
    popularity: 0,
  };
}

async function fetchShikimoriGraphQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  try {
    const res = await fetch(`${SHIKIMORI_BASE}/api/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MiruVerse/1.0",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn(`Shikimori GraphQL warning: ${res.status} ${res.statusText}`);
      return null;
    }

    const { data } = await res.json();
    return data as T;
  } catch (error) {
    console.error("Shikimori GraphQL Error:", error);
    return null;
  }
}

async function fetchShikimori<T>(path: string, params: Record<string, string> = {}): Promise<{ data: T | null; total: number }> {
  const url = new URL(`${SHIKIMORI_BASE}${path}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "MiruVerse/1.0" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn(`Shikimori API warning: ${res.status} ${res.statusText}`);
      return { data: null, total: 0 };
    }

    const data = await res.json() as T;
    const xTotal = res.headers.get("X-Total");
    const total = xTotal ? parseInt(xTotal, 10) : (Array.isArray(data) ? data.length : 0);

    return { data, total };
  } catch (error) {
    console.error("Shikimori API Error:", error);
    return { data: null, total: 0 };
  }
}

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

  const { data } = await fetchShikimori<ShikimoriAnime[]>("/api/animes", {
    ids: malIds.join(","),
    limit: "50",
  });

  if (!data) return map;

  for (const item of data) {
    map.set(item.myanimelist_id ?? item.id, {
      russian: item.russian || "",
      description: "", // batch endpoint doesn't return description
    });
  }

  return map;
}

/**
 * Fetch detailed Russian description for a single anime from Shikimori.
 */
async function fetchShikimoriDetail(malId: number): Promise<{ russian: string; description: string } | null> {
  const { data } = await fetchShikimori<ShikimoriAnime>(`/api/animes/${malId}`);
  if (!data) {
    return null;
  }

  return {
    russian: data.russian || "",
    description: data.description ? stripBBCode(data.description) : "",
  };
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

export async function fetchJikan<T>(endpoint: string, params: Record<string, string> = {}): Promise<JikanResponse<T>> {
  await waitRateLimit();
  
  const url = new URL(`https://api.jikan.moe/v4${endpoint}`);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  try {
    const res = await fetch(url.toString(), { 
      headers: { "User-Agent": "MiruVerse/1.0" },
      // Cache aggressively - Jikan recommends 24 hours for most read-only queries
      next: { revalidate: 86400 } 
    });
    
    if (!res.ok) {
      console.warn(`Jikan API warning: ${res.status} ${res.statusText}`);
      if (res.status === 429) {
         return {};
      }
      return {}; // Silent fallback to avoid crashing SSR
    }
    const payload = await res.json() as JikanResponse<T> & {
      status?: number;
      error?: string;
      message?: string;
    };

    if ((!payload.data && payload.status) || payload.error) {
      console.warn(`Jikan API payload warning: ${payload.status ?? "unknown"} ${payload.message ?? payload.error ?? "Malformed payload"}`);
      return {};
    }

    return payload;
  } catch (error) {
    console.error("Jikan API Error:", error);
    return {};
  }
}

async function fallbackSearchAnime(query: string, page: number): Promise<{ results: TitleData[]; totalResults: number }> {
  const lang = await getLanguage();
  
  const gql = `
    query($search: String, $page: Int) {
      animes(search: $search, limit: 20, page: $page) {
        id
        name
        russian
        english
        score
        status
        episodes
        duration
        poster { originalUrl }
        airedOn { date }
        genres { name }
        studios { name }
      }
    }
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await fetchShikimoriGraphQL<{ animes: any[] }>(gql, { search: query, page });
  
  if (!data?.animes || data.animes.length === 0) {
    return { results: [], totalResults: 0 };
  }

  const results = data.animes.map(item => normalizeShikimoriGraphQLTitle(item, lang));
  const realCount = await fetchKitsuTotalCount({ search: query });

  return {
    results,
    totalResults: realCount || (results.length >= 20 ? 1000 : results.length),
  };
}

async function fallbackPopularAnime(options: {
  page?: number;
  genreId?: number | string;
  sortBy?: "score" | "members" | "favorites" | "start_date";
  sort?: "asc" | "desc";
}): Promise<{ results: TitleData[]; totalResults: number }> {
  const lang = await getLanguage();
  const { page = 1, genreId, sortBy = "members" } = options;

  const order =
    sortBy === "score" ? "ranked" : 
    sortBy === "start_date" ? "aired_on" : 
    "popularity";

  const gql = `
    query($order: OrderEnum, $page: Int, $genre: String) {
      animes(order: $order, limit: 20, page: $page, genre: $genre) {
        id
        name
        russian
        english
        score
        status
        episodes
        duration
        poster { originalUrl }
        airedOn { date }
        genres { name }
        studios { name }
      }
    }
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await fetchShikimoriGraphQL<{ animes: any[] }>(gql, { 
    order, 
    page, 
    genre: genreId?.toString() 
  });

  if (!data?.animes || data.animes.length === 0) {
    return { results: [], totalResults: 0 };
  }

  const results = data.animes.map(item => normalizeShikimoriGraphQLTitle(item, lang));
  const realCount = await fetchKitsuTotalCount({ genre: genreId?.toString() });

  return {
    results,
    totalResults: realCount || (results.length >= 20 ? 1000 : results.length),
  };
}

/**
 * Search MyAnimeList titles natively via Jikan
 */
export async function searchAnime(query: string, page = 1): Promise<{ results: TitleData[], totalResults: number }> {
  try {
    const data = await fetchJikan<JikanAnime[]>("/anime", { q: query, page: page.toString(), limit: "20" });
    if (!data.data || data.data.length === 0) {
      return fallbackSearchAnime(query, page);
    }

    let results = data.data.map((item) => normalizeJikanTitle(item));
    
    // Enrich with Russian names
    results = await enrichWithRussian(results);

    return { 
       results, 
       totalResults: data.pagination?.items?.total || results.length 
    };
  } catch {
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
    sortBy?: "score" | "members" | "favorites" | "start_date";
    sort?: "asc" | "desc";
    status?: string;
  } = {}
): Promise<{ results: TitleData[], totalResults: number }> {
  const { page = 1, genreId, sortBy = "members", sort = "desc", status } = options;

  const params: Record<string, string> = {
    page: page.toString(),
    limit: "20",
    order_by: sortBy === "start_date" ? "start_date" : sortBy,
    sort: sort,
  };

  // Apply status filter (e.g. "airing" for currently airing anime)
  if (status) {
    params["status"] = status;
  }

  if (genreId) {
    params["genres"] = genreId.toString();
    
    const data = await fetchJikan<JikanAnime[]>("/anime", params);
    if (!data.data || data.data.length === 0) {
      return fallbackPopularAnime(options);
    }

    let results = data.data.map((item) => normalizeJikanTitle(item));
    results = await enrichWithRussian(results);
    
    return {
      results,
      totalResults: data.pagination?.items?.total || (results.length >= 20 ? 1000 : results.length)
    };
  } else {
    // If status filter is set, always use /anime (not /top/anime)
    const endpoint = (sortBy === "score" && !status) ? "/top/anime" : "/anime";
    
    const data = await fetchJikan<JikanAnime[]>(endpoint, params);
    if (!data.data || data.data.length === 0) {
      return fallbackPopularAnime(options);
    }

    let results = data.data.map((item) => normalizeJikanTitle(item));
    results = await enrichWithRussian(results);
    
    return {
      results,
      totalResults: data.pagination?.items?.total || (results.length >= 20 ? 1000 : results.length)
    };
  }
}

/**
 * Get anime detail by MAL ID (with full Russian translation for detail pages)
 */
export async function getAnimeDetail(internalId: string): Promise<TitleData | null> {
  const malId = internalId.replace("jikan_", "").replace("anime_", ""); // Fallback cleanup
  
  const data = await fetchJikan<JikanAnime>(`/anime/${malId}/full`);
  if (!data || !data.data) {
     const { data: shikimoriData } = await fetchShikimori<ShikimoriAnime>(`/api/animes/${malId}`);
     if (shikimoriData) {
       const lang = await getLanguage();
       return normalizeShikimoriTitle(shikimoriData, lang);
     }

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
  
  const data = await fetchJikan<JikanRecommendation[]>(`/anime/${malId}/recommendations`);
  const recs = data.data || [];

  if (recs.length === 0) {
    const lang = await getLanguage();
    const { data: shikimoriData } = await fetchShikimori<ShikimoriAnime[]>(`/api/animes/${malId}/similar`);
    return (shikimoriData || []).slice(0, 12).map((item) => normalizeShikimoriTitle(item, lang));
  }
  
  // Format is { entry: { mal_id, title... }, votes }
  let results = recs.slice(0, 12).map((item) => normalizeJikanTitle(item.entry));
  results = await enrichWithRussian(results);
  
  return results;
}
