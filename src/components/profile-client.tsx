"use client";

import { motion } from "framer-motion";
import {
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
  Image as ImageIcon,
} from "lucide-react";
import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { updateProfile } from "@/app/actions/preferences";
import { searchUsers } from "@/app/actions/social";
import type { UserStats, UserSmall } from "@/lib/types";
import { useUploadThing } from "@/utils/uploadthing";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import type { Dictionary } from "@/lib/i18n";
import { AnimatedNumber } from "./animated-number";
import toast from "react-hot-toast";



interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    bio: string | null;
    image: string | null;
    bannerImage: string | null;
    createdAt: string;
  };
  stats: UserStats;
  timeSpent: string;
  topGenres: { name: string; value: number }[];
  followers: UserSmall[];
  following: UserSmall[];
  dict: Dictionary;
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
  const trimmedSearchQuery = searchQuery.trim();

  const formRef = useRef<HTMLFormElement>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadError: (error) => {
      alert(`${dict.common.error}: ${error.message}`);
    },
  });

  const handleCustomUpload = async (file: File, type: "image" | "bannerImage") => {
    const res = await startUpload([file]);
    if (res && res[0]) {
      const formData = new FormData();
      // Read current form values from the DOM to preserve any unsaved edits
      const nameEl = formRef.current?.querySelector<HTMLInputElement>("[name='name']");
      const bioEl = formRef.current?.querySelector<HTMLTextAreaElement>("[name='bio']");
      formData.append("name", nameEl?.value ?? user.name ?? "");
      formData.append("bio", bioEl?.value ?? user.bio ?? "");
      formData.append(type, res[0].url);
      handleSave(formData);
    }
  };

  useEffect(() => {
    if (!trimmedSearchQuery) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchUsers(trimmedSearchQuery);
      setSearchResults(res);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [trimmedSearchQuery]);

  const visibleSearchResults = trimmedSearchQuery ? searchResults : [];

  const handleSave = (formData: FormData) => {
    startTransition(async () => {
      await updateProfile(formData);
      setEditing(false);
      toast.success(dict.profile.save);
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
    <div className="min-h-screen pb-12">
      {/* Hero Banner Section */}
      <div className="relative w-full overflow-hidden flex items-center justify-center max-h-[50vh] md:max-h-[60vh]">
        {user.bannerImage ? (
          <Image
            src={user.bannerImage}
            alt="Profile Banner"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover opacity-60 min-h-[250px] sm:min-h-[350px]"
            priority
          />
        ) : (
          <div className="w-full h-[250px] sm:h-[350px] bg-linear-to-br from-dark-surface via-dark-bg to-dark-surface opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/20 to-transparent" />
        <div className="absolute inset-0 bg-radial-[at_50%_0%] from-neon-cyan/10 to-transparent pointer-events-none" />
        
        {editing && (
          <div className="absolute bottom-6 right-6 z-30">
             <label className="cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl px-6 py-2.5 hover:bg-white/20 transition-all shadow-2xl font-bold text-sm flex items-center gap-2 group/upload">
                <ImageIcon className="w-4 h-4 group-hover/upload:scale-110 transition-transform" />
                <span>{dict.profile.editProfile}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCustomUpload(file, "bannerImage");
                  }}
                />
                {isUploading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
             </label>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-20">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[120px] -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-60 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Avatar with Glow */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group/avatar">
                <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-2xl blur opacity-30 group-hover/avatar:opacity-60 transition duration-500" />
                <div className="w-28 h-28 rounded-2xl bg-dark-card flex items-center justify-center text-3xl font-bold text-white shrink-0 relative overflow-hidden border border-white/10">
                  {user.image ? (
                    <Image src={user.image} alt={user.name || "User"} fill sizes="112px" className="object-cover" />
                  ) : (
                    <span>{user.name?.[0]?.toUpperCase() || "K"}</span>
                  )}
                </div>
              </div>
              
              {editing && (
                <label className="cursor-pointer bg-dark-bg/50 border border-white/10 text-[10px] px-3 py-1.5 rounded-lg hover:border-neon-cyan/50 transition-colors uppercase tracking-widest font-bold flex items-center gap-2">
                  <span>{dict.profile.editProfile}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCustomUpload(file, "image");
                    }}
                  />
                  {isUploading && (
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                </label>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left pt-2">
              {editing ? (
                <form ref={formRef} action={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-dark-muted mb-1.5 uppercase tracking-widest">
                      {dict.auth.name}
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={user.name || ""}
                      className="w-full px-4 py-3 rounded-xl bg-dark-surface/50 border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50 text-sm transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-dark-muted mb-1.5 uppercase tracking-widest">
                      {dict.profile.bio}
                    </label>
                    <textarea
                      name="bio"
                      defaultValue={user.bio || ""}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-dark-surface/50 border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50 text-sm resize-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-white/5 mt-4">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-10 py-3.5 rounded-2xl bg-white text-dark-bg text-sm font-black flex items-center gap-2 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all transform hover:scale-[1.03] active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      {dict.profile.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-8 py-3.5 rounded-2xl bg-dark-surface border border-white/10 text-dark-muted text-sm font-bold hover:text-white hover:border-white/30 transition-all"
                    >
                      {dict.common.cancel}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-4 justify-center sm:justify-start">
                    <h1 className="text-3xl font-black font-heading text-white tracking-tight">
                      {user.name || dict.profile.anonymous}
                    </h1>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-2 rounded-xl bg-white/5 text-dark-muted hover:text-neon-cyan hover:bg-white/10 transition-all border border-white/5"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  {user.bio && (
                    <p className="text-dark-muted mt-3 text-sm max-w-lg leading-relaxed">{user.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-5 text-[10px] font-bold text-neon-cyan/70 justify-center sm:justify-start bg-neon-cyan/5 w-fit px-3 py-1.5 rounded-full border border-neon-cyan/10">
                    <span className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </span>
                    <span className="w-1 h-1 bg-neon-cyan/30 rounded-full" />
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="glass-strong rounded-2xl p-6 border border-white/5 text-center relative overflow-hidden group/stat">
            <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            <BarChart3 className="w-5 h-5 text-neon-cyan mx-auto mb-2" />
            <div className="text-3xl font-black text-white">
              <AnimatedNumber value={stats.totalEntries} />
            </div>
            <div className="text-[10px] font-bold text-dark-muted mt-1 uppercase tracking-widest">{dict.list.total}</div>
          </div>
          <div className="glass-strong rounded-2xl p-6 border border-white/5 text-center relative overflow-hidden group/stat">
            <div className="absolute inset-0 bg-neon-yellow/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            <Star className="w-5 h-5 text-neon-yellow mx-auto mb-2" />
            <div className="text-3xl font-black text-white">
              <AnimatedNumber value={stats.averageScore} precision={1} />
            </div>
            <div className="text-[10px] font-bold text-dark-muted mt-1 uppercase tracking-widest">{dict.list.averageScore}</div>
          </div>
          <div className="glass-strong rounded-2xl p-6 border border-white/5 text-center col-span-2 sm:col-span-1 relative overflow-hidden group/stat">
            <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            <TrendingUp className="w-5 h-5 text-neon-green mx-auto mb-2" />
            <div className="text-3xl font-black text-white">
              <AnimatedNumber value={stats.totalWatched} />
            </div>
            <div className="text-[10px] font-bold text-dark-muted mt-1 uppercase tracking-widest">{dict.list.completed}</div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
                className={`rounded-2xl bg-dark-card/40 border border-white/5 p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 card-shine relative`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color} bg-dark-bg border border-white/5 shadow-inner`}
                >
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    <AnimatedNumber value={s.value} />
                  </div>
                  <div className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">{s.label}</div>
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
              <div className="h-64 w-full cursor-default relative min-w-0">
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

            {visibleSearchResults.length > 0 && trimmedSearchQuery && (
              <div className="glass-strong rounded-2xl p-4 border border-dark-border">
                <h3 className="text-xs text-dark-muted mb-4 uppercase tracking-widest">{dict.common.search}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visibleSearchResults.map((u) => (
                    <Link key={u.id} href={`/users/${u.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-dark-bg overflow-hidden border border-dark-border group-hover:border-neon-cyan/50 transition-colors">
                        {u.image ? (
                          <Image src={u.image} alt={u.name || ""} fill sizes="40px" className="object-cover" />
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
