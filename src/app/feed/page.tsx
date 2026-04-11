import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { getDictionary, getLanguage } from "@/lib/i18n";
import Link from "next/link";
import Image from "next/image";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { Star } from "lucide-react";

export const revalidate = 60; // 1 minute caching for the feed

export default async function FeedPage() {
  const session = await auth();
  const dict = await getDictionary();
  const lang = await getLanguage();

  let followingIds: string[] = [];
  if (session?.user?.id) {
    const follows = await prisma.follows.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    followingIds = follows.map((f) => f.followingId);
  }

  // Fetch activities (limit to followings only as requested)
  // If the user has no followings, the result will (correctly) be an empty list of results
  const whereClause = session?.user?.id 
    ? { userId: { in: followingIds } } 
    : { userId: "none" }; // Guest sees nothing in a "friends-only" feed

  // Fetch recent ListEntries
  const recentEntries = await prisma.listEntry.findMany({
    where: whereClause,
    take: 20,
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      title: true,
    },
  });

  // Fetch recent Reviews
  const recentReviews = await prisma.review.findMany({
    where: whereClause,
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      title: true,
    },
  });

  // Interleave and sort by date descending
  type Activity = 
    | { type: "entry"; data: typeof recentEntries[0]; date: Date }
    | { type: "review"; data: typeof recentReviews[0]; date: Date };

  const activities: Activity[] = [
    ...recentEntries.map(e => ({ type: "entry" as const, data: e, date: e.updatedAt })),
    ...recentReviews.map(r => ({ type: "review" as const, data: r, date: r.createdAt }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 30);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
              {dict.feed.title}
            </span>
          </h1>
          <p className="text-dark-muted">
            {dict.feed.subtitle}
          </p>
        </div>

        <div className="space-y-6">
          {activities.length === 0 ? (
            <div className="text-center py-20 text-dark-muted">
              {session?.user?.id ? dict.feed.empty : dict.feed.emptyGuest}
            </div>
          ) : (
             activities.map((act, i) => {
               const user = act.data.user;
               const title = act.data.title;
               const timeAgo = formatDistanceToNow(act.date, { addSuffix: true, locale: lang === 'en' ? enUS : ru });

               if (act.type === "entry") {
                 const entry = act.data as typeof recentEntries[0];
                 const statusKey = STATUS_LABELS[entry.status as keyof typeof STATUS_LABELS] || entry.status;
                 const statusLabel = (dict.list as Record<string, string>)[statusKey] || statusKey;
                 const statusColor = STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || "#ffffff";

                 return (
                   <div key={`entry-${entry.id}-${i}`} className="glass-strong rounded-2xl p-5 border border-dark-border flex gap-4">
                     <Link href={`/users/${user.id}`} className="shrink-0">
                       <div className="w-10 h-10 rounded-full bg-dark-surface overflow-hidden border border-dark-border">
                         {user.image ? (
                           <Image src={user.image} alt={user.name || "User"} width={40} height={40} className="object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-sm font-bold">{user.name?.[0] || 'K'}</div>
                         )}
                       </div>
                     </Link>
                     <div className="flex-1">
                       <div className="text-sm">
                         <Link href={`/users/${user.id}`} className="font-semibold hover:text-neon-cyan transition-colors">{user.name}</Link>
                         <span className="text-dark-muted mx-1">{dict.feed.added}</span>
                         <Link href={`/title/${title.id}`} className="font-semibold text-white hover:underline">{title.name}</Link>
                         <span className="text-dark-muted mx-1">{dict.feed.to}</span>
                         <span className="font-semibold" style={{ color: statusColor }}>{statusLabel}</span>
                       </div>
                       <div className="text-xs text-dark-muted mt-1">{timeAgo}</div>
                     </div>
                     {title.poster && (
                       <Link href={`/title/${title.id}`}>
                         <div className="w-12 h-16 rounded overflow-hidden shrink-0">
                           <Image src={title.poster} alt={title.name} width={48} height={64} className="object-cover w-full h-full" />
                         </div>
                       </Link>
                     )}
                   </div>
                 );
               }

               if (act.type === "review") {
                 const review = act.data as typeof recentReviews[0];
                 return (
                   <div key={`review-${review.id}-${i}`} className="glass-strong rounded-2xl p-5 border border-dark-border flex gap-4 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-neon-yellow/5 rounded-full blur-3xl" />
                     <Link href={`/users/${user.id}`} className="shrink-0">
                       <div className="w-10 h-10 rounded-full bg-dark-surface overflow-hidden border border-dark-border">
                         {user.image ? (
                           <Image src={user.image} alt={user.name || "User"} width={40} height={40} className="object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-sm font-bold">{user.name?.[0] || 'K'}</div>
                         )}
                       </div>
                     </Link>
                     <div className="flex-1 relative z-10">
                       <div className="text-sm mb-2">
                         <Link href={`/users/${user.id}`} className="font-semibold hover:text-neon-yellow transition-colors">{user.name}</Link>
                         <span className="text-dark-muted mx-1">{dict.feed.reviewed}</span>
                         <Link href={`/title/${title.id}`} className="font-semibold text-white hover:underline">{title.name}</Link>
                       </div>
                       {review.rating && (
                         <div className="flex items-center gap-1 text-neon-yellow mb-2 text-sm bg-neon-yellow/10 w-max px-2 py-0.5 rounded-full border border-neon-yellow/20">
                           <Star className="w-4 h-4 fill-current" /> {review.rating}/10
                         </div>
                       )}
                       <p className="text-sm text-gray-300 italic">«{review.content.length > 150 ? review.content.substring(0, 150) + "..." : review.content}»</p>
                       <div className="text-xs text-dark-muted mt-2">{timeAgo}</div>
                     </div>
                   </div>
                 );
               }
             })
          )}
        </div>
      </div>
    </div>
  );
}
