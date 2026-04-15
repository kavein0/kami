import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PublicProfileClient } from "@/components/public-profile-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const decodedId = decodeURIComponent(id);

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: decodedId },
        { name: decodedId }
      ]
    },
    include: {
      followers: { include: { follower: { select: { id: true, name: true, image: true } } } },
      following: { include: { following: { select: { id: true, name: true, image: true } } } },
    }
  });

  if (!user) notFound();

  const isSelf = session?.user?.id === user.id;

  let isFollowing = false;
  if (session?.user?.id && !isSelf) {
    const followRecord = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id
        }
      }
    });
    isFollowing = !!followRecord;
  }

  // Calculate Gamification Stats
  const avgScoreRes = await prisma.listEntry.aggregate({
    where: { userId: user.id, score: { not: null } },
    _avg: { score: true },
  });
  const avgScore = avgScoreRes._avg.score || 0;

  const totalEntries = await prisma.listEntry.count({
    where: { userId: user.id },
  });

  const userEntries = await prisma.listEntry.findMany({
    where: { userId: user.id },
    include: { title: true },
  });

  const statsMap: Record<string, number> = {};
  let totalMinutesWatched = 0;
  const genreCounts: Record<string, number> = {};

  userEntries.forEach((entry) => {
    statsMap[entry.status] = (statsMap[entry.status] || 0) + 1;

    if (entry.status === "watched") {
      if (entry.title.type === "movie" && entry.title.duration) {
        const mins = parseInt(entry.title.duration.replace(/\D/g, ""));
        if (!isNaN(mins)) totalMinutesWatched += mins;
      } else if (entry.title.type !== "movie" && entry.title.episodes) {
        totalMinutesWatched += entry.title.episodes * 24;
      }

      if (entry.title.genres) {
        entry.title.genres.split(",").forEach((g) => {
          const cleanGenre = g.trim();
          if (cleanGenre) {
            genreCounts[cleanGenre] = (genreCounts[cleanGenre] || 0) + 1;
          }
        });
      }
    }
  });

  const topGenres = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const daysSpent = Math.floor(totalMinutesWatched / (24 * 60));
  const hoursSpent = Math.floor((totalMinutesWatched % (24 * 60)) / 60);
  const timeSpentString = daysSpent > 0 
    ? `${daysSpent} д. ${hoursSpent} ч.` 
    : `${hoursSpent} ч.`;

  // Get a fallback banner from user's most recent highly rated titles
  const recentHighRated = await prisma.listEntry.findFirst({
    where: { 
      userId: user.id, 
      status: { in: ["watched", "watching"] },
      title: { backdrop: { not: null } }
    },
    orderBy: { score: "desc" },
    include: { title: true }
  });

  const fallbackBanner = recentHighRated?.title.backdrop || null;

  return (
    <PublicProfileClient
      user={{
        id: user.id,
        name: user.name || "",
        bio: user.bio,
        image: user.image,
        bannerImage: user.bannerImage || fallbackBanner,
        createdAt: user.createdAt.toISOString(),
      }}
      stats={{
        totalWatched: statsMap["watched"] || 0,
        totalWatching: statsMap["watching"] || 0,
        totalPlanToWatch: statsMap["plan_to_watch"] || 0,
        totalDropped: statsMap["dropped"] || 0,
        totalOnHold: statsMap["on_hold"] || 0,
        averageScore: avgScore,
        totalEntries,
      }}
      topGenres={topGenres}
      timeSpent={timeSpentString}
      followers={user.followers.map(f => f.follower)}
      following={user.following.map(f => f.following)}
      isFollowing={isFollowing}
      isSelf={isSelf}
    />
  );
}
