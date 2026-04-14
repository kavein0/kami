"use client";

import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Save,
  Eye,
  Play,
  Clock,
  XCircle,
  Pause,
  TrendingUp,
  Search as SearchIcon,
  Users,
  BarChart3,
  Star,
} from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { updateProfile, searchUsers } from "@/app/actions";
import type { UserStats } from "@/lib/types";
import { UploadButton } from "@/utils/uploadthing";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface UserSmall {
  id: string;
  name: string | null;
  image: string | null;
}

interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    bio: string | null;
    image: string | null;
    createdAt: string;
  };
  stats: UserStats;
  timeSpent: string;
  topGenres: { name: string; value: number }[];
  followers: UserSmall[];
  following: UserSmall[];
  dict: ReturnType<typeof import("@/lib/i18n").getDictionarySync>;
  lang: string;
}

const COLORS = ["#00f0ff", "#ff0055", "#aa77ff", "#00ff88", "#ffaa00"];

export function ProfileClient({ 
  user, 
  stats, 
  timeSpent, 
  topGenres, 
  followers, 
  following, 
  dict, 
  lang 
}: ProfileClientProps) {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "social">("overview");
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSmall[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchUsers(searchQuery);
      setSearchResults(res);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSave = (formData: FormData) => {
    startTransition(async () => {
      await updateProfile(formData);
      setEditing(false);
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
          className="glass-strong rounded-3xl p-8 border border-dark-border mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-pink flex items-center justify-center text-3xl font-bold text-dark-bg shrink-0 relative overflow-hidden">
                {user.image ? (
                  <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
                ) : (
                  <span>{user.name?.[0]?.toUpperCase() || "K"}</span>
                )}
              </div>
              
              {editing && (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      const formData = new FormData();
                      formData.append("name", user.name || "");
                      formData.append("bio", user.bio || "");
                      formData.append("image", res[0].url);
                      handleSave(formData);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`${dict.common.error}: ${error.message}`);
                  }}
                  appearance={{
                    button: "bg-dark-border text-xs px-2 py-1 max-h-8 rounded",
                    allowedContent: "hidden"
                  }}
                  content={{
                    button: dict.profile.editProfile,
                  }}
                />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <form action={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs text-dark-muted mb-1 uppercase tracking-wider">
                      {dict.auth.name}
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={user.name || ""}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text focus:outline-none focus:border-neon-cyan/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-muted mb-1 uppercase tracking-wider">
                      {dict.profile.bio}
                    </label>
                    <textarea
                      name="bio"
                      defaultValue={user.bio || ""}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text focus:outline-none focus:border-neon-cyan/50 text-sm resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-bg text-sm font-medium flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {dict.profile.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-5 py-2 rounded-xl bg-dark-surface border border-dark-border text-dark-muted text-sm"
                    >
                      {dict.common.cancel}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <h1 className="text-2xl font-bold text-white">
                      {user.name || dict.profile.anonymous}
                    </h1>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1.5 rounded-lg text-dark-muted hover:text-neon-cyan transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  {user.bio && (
                    <p className="text-dark-muted mt-2 text-sm">{user.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-dark-muted justify-center sm:justify-start">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.createdAt).toLocaleDateString(lang === 'ru' ? "ru-RU" : "en-US")}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="glass rounded-2xl p-5 border border-dark-border text-center">
            <BarChart3 className="w-5 h-5 text-neon-cyan mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {stats.totalEntries}
            </div>
            <div className="text-xs text-dark-muted mt-1">{dict.list.total}</div>
          </div>
          <div className="glass rounded-2xl p-5 border border-dark-border text-center">
            <Star className="w-5 h-5 text-neon-yellow mx-auto mb-2" />
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
            {/* Status breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-bold mb-4">{dict.profile.statsByStatus}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`rounded-2xl bg-gradient-to-br ${s.bg} border border-dark-border p-4 flex items-center gap-4`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} bg-dark-surface`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-dark-muted">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Gamification & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          {/* Genre Chart */}
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
              <div className="flex-1 flex flex-col items-center justify-center text-dark-muted h-64">
                <p>{dict.profile.notEnoughData}</p>
                <p className="text-xs mt-1">{dict.profile.notEnoughDataDesc}</p>
              </div>
            )}
            
            {/* Custom Legend */}
            {topGenres && topGenres.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {topGenres.map((g, i) => (
                  <div key={g.name} className="flex items-center gap-2 text-xs text-dark-muted">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    <span className="text-white">{g.name}</span>
                    <span className="font-semibold px-1 rounded bg-dark-bg/50">{g.value}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Time & Badges */}
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

            {/* Badges */}
            <div className="glass-strong rounded-3xl p-6 border border-dark-border flex-1">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-neon-yellow" /> {dict.profile.achievements}
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
          </motion.div>
        </div>
      </>
    ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* User Search */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.social.searchUser}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-dark-surface border border-dark-border text-dark-text focus:outline-none focus:border-neon-cyan/50 transition-all font-medium"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <div className="w-5 h-5 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
                </div>
              )}
            </div>

            {searchResults.length > 0 && searchQuery && (
              <div className="glass-strong rounded-2xl p-4 border border-dark-border">
                <h3 className="text-xs text-dark-muted mb-4 uppercase tracking-widest">{dict.common.search}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.map((u) => (
                    <Link key={u.id} href={`/users/${u.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-dark-bg overflow-hidden border border-dark-border group-hover:border-neon-cyan/50 transition-colors">
                        {u.image ? (
                          <Image src={u.image} alt={u.name || ""} width={40} height={40} className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-dark-muted">{u.name?.[0]}</div>
                        )}
                      </div>
                      <span className="font-bold text-dark-text group-hover:text-neon-cyan transition-colors">{u.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Following/Followers Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
                  <Users className="w-5 h-5 text-neon-cyan" />
                  {dict.profile.following} ({following.length})
                </h3>
                {following.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                     {following.map(u => (
                        <Link key={u.id} href={`/users/${u.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface/50 border border-dark-border hover:border-dark-muted transition-all">
                           <div className="w-8 h-8 rounded-full bg-dark-bg overflow-hidden flex items-center justify-center border border-dark-border">
                             {u.image ? <Image src={u.image} alt={u.name || ""} width={32} height={32} /> : <span className="text-xs">{u.name?.[0]}</span>}
                           </div>
                           <span className="text-sm font-medium">{u.name}</span>
                        </Link>
                     ))}
                  </div>
                ) : <p className="text-sm text-dark-muted py-4">{dict.social.noFriends}</p>}
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
                  <Users className="w-5 h-5 text-neon-pink" />
                  {dict.profile.followers} ({followers.length})
                </h3>
                {followers.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                     {followers.map(u => (
                        <Link key={u.id} href={`/users/${u.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface/50 border border-dark-border hover:border-dark-muted transition-all">
                           <div className="w-8 h-8 rounded-full bg-dark-bg overflow-hidden flex items-center justify-center border border-dark-border">
                             {u.image ? <Image src={u.image} alt={u.name || ""} width={32} height={32} /> : <span className="text-xs">{u.name?.[0]}</span>}
                           </div>
                           <span className="text-sm font-medium">{u.name}</span>
                        </Link>
                     ))}
                  </div>
                ) : <p className="text-sm text-dark-muted py-4">{dict.profile.noFollowers}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
