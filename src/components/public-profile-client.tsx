"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Eye,
  Play,
  Clock,
  XCircle,
  Pause,
  TrendingUp,
  BarChart3,
  Star as StarIcon,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toggleFollow } from "@/app/actions/social";
import type { UserStats, UserSmall } from "@/lib/types";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { useDictionary } from "./dictionary-provider";

interface PublicProfileClientProps {
  user: {
    id: string;
    name: string;
    bio: string | null;
    image: string | null;
    createdAt: string;
  };
  stats: UserStats;
  timeSpent: string;
  topGenres: { name: string; value: number }[];
  followers: UserSmall[];
  following: UserSmall[];
  isFollowing: boolean;
  isSelf: boolean;
}

const COLORS = ["#00f0ff", "#ff0055", "#aa77ff", "#00ff88", "#ffaa00"];

export function PublicProfileClient({ 
  user, 
  stats, 
  timeSpent, 
  topGenres, 
  followers,
  following,
  isFollowing: initialIsFollowing,
  isSelf
}: PublicProfileClientProps) {
  const dict = useDictionary();
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [activeTab, setActiveTab] = useState<"overview" | "social">("overview");

  const handleFollow = () => {
    setIsFollowing(!isFollowing); // Optimistic update
    startTransition(async () => {
      try {
        await toggleFollow(user.id);
      } catch (err) {
        setIsFollowing(initialIsFollowing); // Rollback
      }
    });
  };

  const statCards = [
    { label: dict.list.completed, value: stats.totalWatched, icon: Eye, color: "text-neon-cyan", bg: "from-neon-cyan/10 to-neon-cyan/5" },
    { label: dict.list.watching, value: stats.totalWatching, icon: Play, color: "text-neon-green", bg: "from-neon-green/10 to-neon-green/5" },
    { label: dict.list.planned, value: stats.totalPlanToWatch, icon: Clock, color: "text-neon-yellow", bg: "from-neon-yellow/10 to-neon-yellow/5" },
    { label: dict.list.dropped, value: stats.totalDropped, icon: XCircle, color: "text-neon-pink", bg: "from-neon-pink/10 to-neon-pink/5" },
    { label: dict.list.onHold, value: stats.totalOnHold, icon: Pause, color: "text-neon-purple", bg: "from-neon-purple/10 to-neon-purple/5" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-8 border border-dark-border mb-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-pink flex items-center justify-center text-3xl font-bold text-dark-bg shrink-0 relative overflow-hidden">
              {user.image ? (
                <div className="relative w-full h-full">
                  <Image src={user.image} alt={user.name || "User"} fill sizes="96px" className="object-cover" />
                </div>
              ) : (
                <span>{user.name?.[0]?.toUpperCase() || "K"}</span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {user.name || dict.profile.anonymous}
                  </h1>
                  {user.bio && (
                    <p className="text-dark-muted text-sm max-w-lg">{user.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-dark-muted justify-center sm:justify-start">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {!isSelf && (
                  <button
                    onClick={handleFollow}
                    disabled={isPending}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
                      isFollowing 
                        ? "bg-dark-surface border border-dark-border text-dark-text hover:border-neon-pink/50 hover:text-neon-pink" 
                        : "bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-bg hover:opacity-90 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        {dict.profile.unfollow}
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        {dict.profile.follow}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-8 border-b border-dark-border">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "overview" ? "text-neon-cyan" : "text-dark-muted hover:text-dark-text"
            }`}
          >
            {dict.profile.overview}
            {activeTab === "overview" && (
              <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "social" ? "text-neon-cyan" : "text-dark-muted hover:text-dark-text"
            }`}
          >
            {dict.profile.social}
            {activeTab === "social" && (
              <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan" />
            )}
          </button>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="glass rounded-2xl p-5 border border-dark-border text-center">
                <BarChart3 className="w-5 h-5 text-neon-cyan mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {stats.totalEntries}
                </div>
                <div className="text-xs text-dark-muted mt-1">{dict.list.total}</div>
              </div>
              <div className="glass rounded-2xl p-5 border border-dark-border text-center">
                <StarIcon className="w-5 h-5 text-neon-yellow mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {stats.averageScore ? stats.averageScore.toFixed(1) : "—"}
                </div>
                <div className="text-xs text-dark-muted mt-1">{dict.list.averageScore}</div>
              </div>
              <div className="glass rounded-2xl p-5 border border-dark-border text-center col-span-2 sm:col-span-1">
                <TrendingUp className="w-5 h-5 text-neon-green mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {stats.totalWatched}
                </div>
                <div className="text-xs text-dark-muted mt-1">{dict.list.completed}</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {statCards.map((s, i) => (
                <div
                  key={s.label}
                  className={`rounded-2xl bg-gradient-to-br ${s.bg} border border-dark-border p-4 flex items-center gap-4`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} bg-dark-surface`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-dark-muted">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

        {/* Gamification Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          {/* Genre Chart */}
          <div className="glass-strong rounded-3xl p-6 border border-dark-border flex flex-col items-center min-w-0">
            <h2 className="text-lg font-bold mb-4 w-full">{dict.profile.favoriteGenres}</h2>
            {topGenres && topGenres.length > 0 ? (
              <>
                <div className="h-64 w-full relative min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topGenres}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {topGenres.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: "#060A14", border: "1px solid #1E293B", borderRadius: "12px", color: "white" }} 
                        itemStyle={{ color: "white" }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom Legend */}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {topGenres.map((g, i) => (
                    <div key={g.name} className="flex items-center gap-2 text-xs text-dark-muted">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                      <span className="text-white">{g.name}</span>
                      <span className="font-semibold px-1 rounded bg-dark-bg/50">{g.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-dark-muted h-64">
                <p>{dict.profile.notEnoughData}</p>
                <p className="text-xs mt-1">{dict.profile.notEnoughDataDesc}</p>
              </div>
            )}
          </div>

          {/* Time & Badges */}
          <div className="flex flex-col gap-8">
            {/* Time Spent */}
            <div className="glass-strong rounded-3xl p-6 border border-dark-border text-center overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-cyan/10 rounded-full blur-2xl pointer-events-none" />
              <Clock className="w-8 h-8 text-neon-cyan mx-auto mb-3" />
              <h3 className="text-sm text-dark-muted mb-1">{dict.profile.timeSpentWatching}</h3>
              <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-neon-cyan to-white bg-clip-text text-transparent">
                {timeSpent}
              </p>
            </div>

            {/* Badges */}
            <div className="glass-strong rounded-3xl p-6 border border-dark-border flex-1">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-neon-yellow" /> {dict.profile.achievements}
              </h2>
              <div className="flex flex-wrap gap-3">
                {stats.totalWatched > 0 ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ffaa00]/10 border border-[#ffaa00]/20 max-w-fit">
                    <span className="text-[#ffaa00] text-lg">🍿</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{dict.profile.badgeNovice}</div>
                      <div className="text-[10px] text-[#ffaa00]/70">{dict.profile.badgeNoviceDesc}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-dark-muted w-full text-center py-4">{dict.profile.noAchievements}</p>
                )}

                {stats.totalWatched >= 50 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 max-w-fit">
                    <span className="text-neon-cyan text-lg">⛩️</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{dict.profile.badgeRegular}</div>
                      <div className="text-[10px] text-neon-cyan/70">{dict.profile.badgeRegularDesc}</div>
                    </div>
                  </div>
                )}

                {stats.totalWatched >= 200 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neon-pink/10 border border-neon-pink/20 max-w-fit">
                    <span className="text-neon-pink text-lg">👑</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{dict.profile.badgeOtaku}</div>
                      <div className="text-[10px] text-neon-pink/70">{dict.profile.badgeOtakuDesc}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold mb-6 text-white">
                <UserPlus className="w-5 h-5 text-neon-cyan" />
                {dict.profile.following} ({following.length})
              </h3>
              {following.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                   {following.map(u => (
                      <Link key={u.id} href={`/users/${u.id}`} className="flex items-center gap-4 p-4 rounded-2xl bg-dark-surface/50 border border-dark-border hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all group">
                         <div className="w-12 h-12 rounded-full bg-dark-bg overflow-hidden flex items-center justify-center border border-dark-border group-hover:border-neon-cyan/50 transition-colors relative">
                           {u.image ? (
                             <div className="relative w-full h-full">
                               <Image src={u.image} alt={u.name || ""} fill sizes="48px" className="object-cover" />
                             </div>
                           ) : (
                             <span className="text-sm font-bold text-dark-muted">{u.name?.[0]?.toUpperCase()}</span>
                           )}
                         </div>
                         <span className="font-bold text-dark-text group-hover:text-neon-cyan transition-colors">{u.name}</span>
                      </Link>
                   ))}
                </div>
              ) : (
                <div className="glass rounded-3xl p-8 border border-dark-border border-dashed text-center text-dark-muted">
                  {dict.social.noFriends}
                </div>
              )}
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold mb-6 text-white">
                <UserPlus className="w-5 h-5 text-neon-pink" />
                {dict.profile.followers} ({followers.length})
              </h3>
              {followers.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                   {followers.map(u => (
                      <Link key={u.id} href={`/users/${u.id}`} className="flex items-center gap-4 p-4 rounded-2xl bg-dark-surface/50 border border-dark-border hover:border-neon-pink/50 hover:bg-neon-pink/5 transition-all group">
                         <div className="w-12 h-12 rounded-full bg-dark-bg overflow-hidden flex items-center justify-center border border-dark-border group-hover:border-neon-pink/50 transition-colors">
                           {u.image ? (
                             <div className="relative w-full h-full">
                               <Image src={u.image} alt={u.name || ""} fill className="object-cover" />
                             </div>
                           ) : (
                             <span className="text-sm font-bold text-dark-muted">{u.name?.[0]?.toUpperCase()}</span>
                           )}
                         </div>
                         <span className="font-bold text-dark-text group-hover:text-neon-pink transition-colors">{u.name}</span>
                      </Link>
                   ))}
                </div>
              ) : (
                <div className="glass rounded-3xl p-8 border border-dark-border border-dashed text-center text-dark-muted">
                  {dict.profile.noFollowers}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
