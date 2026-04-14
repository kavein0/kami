import { prisma } from "./prisma";
import { getPopularAnime } from "./jikan";

const ACTIVITY_FEED_LIMIT = 12;

export async function getPersonalizedRecommendations(userId?: string) {
  if (!userId) {
    // If not logged in, show trending anime
    const { results } = await getPopularAnime({ sortBy: "score", page: 1 });
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
    const { results } = await getPopularAnime({ sortBy: "score", page: 1 });
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
    const { results } = await getPopularAnime({ page: 2 });
    return results.slice(0, 8);
  }

  // Fetch a different page of top anime to get variety
  const { results } = await getPopularAnime({ sortBy: "score", page: 2 });
  
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

export async function getActivityFeedTitles(userId?: string) {
  let relevantUserIds: string[] | undefined;

  if (userId) {
    const me = await prisma.user.findUnique({
      where: { id: userId },
      include: { following: true },
    });

    if (me) {
      relevantUserIds = [userId, ...me.following.map((f) => f.followingId)];
    }
  }

  const listEntries = await prisma.listEntry.findMany({
    where: relevantUserIds ? { userId: { in: relevantUserIds } } : undefined,
    include: { title: true },
    orderBy: { updatedAt: "desc" },
    take: 60,
  });

  const reviews = await prisma.review.findMany({
    where: relevantUserIds ? { userId: { in: relevantUserIds } } : undefined,
    include: { title: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const activity = [
    ...listEntries.map((entry) => ({ date: entry.updatedAt, title: entry.title })),
    ...reviews.map((review) => ({ date: review.createdAt, title: review.title })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const uniqueByTitleId = new Map<string, (typeof activity)[number]["title"]>();
  for (const item of activity) {
    if (!uniqueByTitleId.has(item.title.id)) {
      uniqueByTitleId.set(item.title.id, item.title);
    }
    if (uniqueByTitleId.size >= ACTIVITY_FEED_LIMIT) break;
  }

  const titles = Array.from(uniqueByTitleId.values());
  if (titles.length >= ACTIVITY_FEED_LIMIT) return titles;

  const { results } = await getPopularAnime({ sortBy: "score", page: 1 });
  const padding = results
    .filter((r) => !uniqueByTitleId.has(r.id))
    .slice(0, ACTIVITY_FEED_LIMIT - titles.length);
  return [...titles, ...padding];
}
