"use client";

import { motion } from "framer-motion";
import { User, Calendar, BarChart3, Star, TrendingUp, Clock, Eye, Play, Pause, XCircle } from "lucide-react";
import Image from "next/image";
import { useTransition } from "react";
import { toggleFollow } from "@/app/actions/social";
import { useDictionary } from "./dictionary-provider";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface Props {
  user: {
    id: string;
    name: string | null;
    bio: string | null;
    image: string | null;
    createdAt: Date;
    _count: {
      followers: number;
      following: number;
    }
  };
  stats: {
    totalWatched: number;
    totalWatching: number;
    totalPlanToWatch: number;
    totalDropped: number;
    totalOnHold: number;
    averageScore: number;
    totalEntries: number;
  };
  topGenres: { name: string; value: number }[];
  timeSpent: string;
  isFollowing: boolean;
  isSelf: boolean;
}

const COLORS = ["#00f0ff", "#ff0055", "#aa77ff", "#00ff88", "#ffaa00"];

export function PublicProfileClient({ user, stats, topGenres, timeSpent, isFollowing, isSelf }: Props) {
  const [isPending, startTransition] = useTransition();
  const dict = useDictionary();

  const handleFollow = () => {
    startTransition(async () => {
      await toggleFollow(user.id);
    });
  };

  const statCards = [
    { label: dict.list.completed || "Completed", value: stats.totalWatched, icon: Eye, color: "text-neon-cyan", bg: "from-neon-cyan/10 to-neon-cyan/5" },
    { label: dict.list.watching || "Watching", value: stats.totalWatching, icon: Play, color: "text-neon-green", bg: "from-neon-green/10 to-neon-green/5" },
    { label: dict.list.dropped || "Dropped", value: stats.totalDropped, icon: XCircle, color: "text-neon-pink", bg: "from-neon-pink/10 to-neon-pink/5" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-8 border border-dark-border mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-3xl font-bold text-dark-bg shrink-0 relative overflow-hidden border border-dark-border">
            {user.image ? (
              <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
            ) : (
              <span>{user.name?.[0]?.toUpperCase() || "K"}</span>
            )}
          </div>
          
          <div className="flex-1 text-center sm:text-left relative z-10">
            <h1 className="text-2xl font-bold text-white mb-2">{user.name || dict.profile.anonymous}</h1>
            {user.bio && <p className="text-dark-muted mb-4 text-sm max-w-lg">{user.bio}</p>}
            
            <div className="flex items-center justify-center sm:justify-start gap-4 text-sm font-medium mb-4">
              <div className="bg-dark-surface px-3 py-1.5 rounded-lg border border-dark-border">
                <span className="text-white">{user._count.followers}</span> <span className="text-dark-muted">{dict.profile.followers}</span>
              </div>
              <div className="bg-dark-surface px-3 py-1.5 rounded-lg border border-dark-border">
                 <span className="text-white">{user._count.following}</span> <span className="text-dark-muted">{dict.profile.following}</span>
              </div>
            </div>

            {!isSelf && (
              <button
                onClick={handleFollow}
                disabled={isPending}
                className={`px-8 py-2.5 rounded-xl font-semibold transition-all ${
                  isFollowing
                    ? "bg-dark-surface border border-dark-border text-dark-muted hover:text-white"
                    : "bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-bg hover:opacity-90"
                }`}
              >
                {isPending ? "..." : isFollowing ? dict.profile.unfollow : dict.profile.follow}
              </button>
            )}
          </div>
        </motion.div>

        {/* Gamification Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-strong rounded-3xl p-6 border border-dark-border flex flex-col"
            >
              <h2 className="text-lg font-bold mb-4">{dict.profile.favoriteGenres}</h2>
              {topGenres && topGenres.length > 0 ? (
                <div className="h-64 cursor-default">
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
              ) : (
                <div className="flex-1 flex items-center justify-center text-dark-muted text-sm">{dict.profile.notEnoughData}</div>
              )}
               {/* Custom Legend */}
              {topGenres && topGenres.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {topGenres.map((g, i) => (
                    <div key={g.name} className="flex items-center gap-2 text-xs text-dark-muted">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                      <span className="text-white">{g.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-8"
            >
              {/* Time Spent */}
              <div className="glass-strong rounded-3xl p-6 border border-dark-border text-center overflow-hidden relative">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-cyan/10 rounded-full blur-2xl pointer-events-none" />
                <Clock className="w-8 h-8 text-neon-cyan mx-auto mb-3" />
                <h3 className="text-sm text-dark-muted mb-1">{dict.profile.timeSpentWatching}</h3>
                <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-neon-cyan to-white bg-clip-text text-transparent">
                  {timeSpent}
                </p>
              </div>

              {/* Status breakdown mini */}
              <div className="glass-strong rounded-3xl p-6 border border-dark-border flex-1">
                <h2 className="text-lg font-bold mb-4">{dict.profile.statsByStatus}</h2>
                <div className="space-y-3">
                  {statCards.map((s) => (
                    <div key={s.label} className="flex justify-between border-b border-dark-border/50 pb-2 text-sm">
                       <span className="text-dark-muted flex items-center gap-2"><s.icon className={`w-4 h-4 ${s.color}`} /> {s.label}</span>
                       <span className="text-white font-bold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
        </div>

      </div>
    </div>
  );
}
