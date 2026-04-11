import { prisma } from "./prisma";
import { getPopularTitles } from "./tmdb";

export async function getPersonalizedRecommendations(userId?: string) {
  if (!userId) {
    // If not logged in, just return trending across all platforms
    const { results } = await getPopularTitles("tv", { sortBy: "popularity.desc", page: 2 });
    return results.slice(0, 8);
  }

  // Get user's recent or highly rated entries
  const listEntries = await prisma.listEntry.findMany({
    where: {
      userId,
      status: { in: ["watching", "completed"] },
    },
    include: {
      title: true,
    },
    take: 10,
    orderBy: { updatedAt: "desc" },
  });

  if (listEntries.length === 0) {
    // Fallback if no entries
    const { results } = await getPopularTitles("tv", { sortBy: "popularity.desc", page: 2 });
    return results.slice(0, 8);
  }

  // Extract unique genres from history
  const genreSet = new Set<string>();
  listEntries.forEach((entry) => {
    if (entry.title.genres) {
      entry.title.genres.split(",").forEach((g) => genreSet.add(g.trim()));
    }
  });

  const genresArray = Array.from(genreSet);
  if (genresArray.length === 0) {
    const { results } = await getPopularTitles("tv", { page: 2 });
    return results.slice(0, 8);
  }

  // In a real sophisticated TMDB call, we'd map our text genres to TMDB genre IDs.
  // We'll approximate by finding popular items (page 3) and filtering locally
  const { results } = await getPopularTitles("tv", { sortBy: "popularity.desc", page: 3 });
  
  // Filter by matching genres
  const recommended = results.filter((item) => {
    if (!item.genres) return false;
    const itemGenres = item.genres.split(",").map(g => g.trim());
    return itemGenres.some(g => genresArray.includes(g));
  });

  // If not enough matches, pad with other popular ones
  if (recommended.length < 8) {
    const padding = results.filter(item => !recommended.some(r => r.id === item.id)).slice(0, 8 - recommended.length);
    return [...recommended, ...padding];
  }

  return recommended.slice(0, 8);
}
