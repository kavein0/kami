import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile-client";
import { getDictionary, getLanguage } from "@/lib/i18n";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      followers: { include: { follower: { select: { id: true, name: true, image: true } } } },
      following: { include: { following: { select: { id: true, name: true, image: true } } } },
    }
  });

  if (!user) {
    redirect("/logout");
  }

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

  const dict = await getDictionary();
  const lang = await getLanguage();

  const avgScoreRes = await prisma.listEntry.aggregate({
    where: { userId: session.user.id, score: { not: null } },
    _avg: { score: true },
  });
  const avgScore = avgScoreRes._avg.score || 0;

  const totalEntries = await prisma.listEntry.count({
    where: { userId: session.user.id },
  });

  const userEntries = await prisma.listEntry.findMany({
    where: { userId: session.user.id },
    include: { title: true },
  });

  const statsMap: Record<string, number> = {};
  let totalMinutesWatched = 0;
  const genreCounts: Record<string, number> = {};

  userEntries.forEach((entry) => {
    // Status count
    statsMap[entry.status] = (statsMap[entry.status] || 0) + 1;

    // Time & Genres only for watched/watching items? Let's do just watched
    if (entry.status === "watched") {
      if (entry.title.type === "movie" && entry.title.duration) {
        const mins = parseInt(entry.title.duration.replace(/\D/g, ""));
        if (!isNaN(mins)) totalMinutesWatched += mins;
      } else if (entry.title.type !== "movie" && entry.title.episodes) {
        // Average 24 min per episode
        totalMinutesWatched += entry.title.episodes * 24;
      }

      if (entry.title.genres) {
        entry.title.genres.split(",").forEach((g) => {
          const cleanGenre = g.trim();
          if (cleanGenre) {
            // Map Russian genre from DB to localized string from dict
            const localizedGenre = (dict.genres as Record<string, string>)[cleanGenre] || cleanGenre;
            genreCounts[localizedGenre] = (genreCounts[localizedGenre] || 0) + 1;
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
    ? `${daysSpent} ${dict.profile.days} ${hoursSpent} ${dict.profile.hours}` 
    : `${hoursSpent} ${dict.profile.hours}`;

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name || "",
        email: user.email || "",
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
      timeSpent={timeSpentString}
      topGenres={topGenres}
      followers={user.followers.map(f => f.follower)}
      following={user.following.map(f => f.following)}
      dict={dict}
      lang={lang}
    />
  );
}
