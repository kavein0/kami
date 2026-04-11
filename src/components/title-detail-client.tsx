"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Calendar,
  Clock,
  Tv,
  Film,
  Play,
  Building2,
  BarChart3,
  ArrowLeft,
  MessageSquare,
  Send
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { StatusButtons } from "@/components/status-buttons";
import { submitReview } from "@/app/actions";
import { TitleCard } from "@/components/title-card";
import type { TitleData } from "@/lib/types";

interface TitleDetailClientProps {
  title: TitleData;
  userEntry: { id: string; status: string; score: number | null } | null;
  similarTitles: TitleData[];
  isLoggedIn: boolean;
  reviews?: Array<{
    id: string;
    content: string;
    rating: number | null;
    createdAt: Date;
    user: { id: string; name: string | null; image: string | null };
  }>;
  dict: any;
}

export function TitleDetailClient({
  title,
  userEntry,
  similarTitles,
  isLoggedIn,
  reviews = [],
  dict,
}: TitleDetailClientProps) {
  const genres = title.genres ? title.genres.split(",") : [];
  const [reviewText, setReviewText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    
    startTransition(async () => {
      await submitReview(title.id, reviewText, userEntry?.score || 0);
      setReviewText("");
    });
  };

  let youtubeId: string | null = null;
  try {
    if (title.trailer) {
      youtubeId = new URL(title.trailer).searchParams.get("v");
    }
  } catch {
    // Invalid trailer URL — skip
  }

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative w-full h-[40vh] md:h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: title.backdrop
              ? `url(${title.backdrop})`
              : title.poster
              ? `url(${title.poster})`
              : "linear-gradient(135deg, #1a1a2e, #0a0a0f)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-dark-bg/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/70 via-transparent to-transparent" />

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-20 left-4 sm:left-6 z-20"
        >
          <Link
            href="/browse"
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-dark-muted hover:text-dark-text transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.nav.catalog}
          </Link>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-24 sm:-mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="shrink-0"
          >
            <div className="w-48 sm:w-56 md:w-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-dark-border neon-glow-cyan mx-auto md:mx-0">
              <div
                className="w-full aspect-[2/3] bg-cover bg-center"
                style={{
                  backgroundImage: title.poster
                    ? `url(${title.poster})`
                    : "linear-gradient(135deg, #1a1a2e, #12121a)",
                }}
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex-1 space-y-5"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                {title.type === "anime" ? (
                  <Tv className="w-5 h-5 text-neon-cyan" />
                ) : (
                  <Film className="w-5 h-5 text-neon-cyan" />
                )}
                <span className="text-xs font-semibold text-neon-cyan uppercase tracking-[0.2em]">
                  {title.type === "anime"
                    ? (dict.browse.tabAnime || "Anime")
                    : title.type === "movie"
                    ? (dict.browse.tabMovies || "Movie")
                    : (dict.browse.tabSeries || "Series")}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                {title.name}
              </h1>
              {title.nameEn && (
                <p className="text-lg text-dark-muted mt-1">{title.nameEn}</p>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {title.rating && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass">
                  <Star className="w-4 h-4 text-neon-yellow fill-neon-yellow" />
                  <span className="font-bold text-neon-yellow">
                    {title.rating.toFixed(1)}
                  </span>
                </div>
              )}
              {title.year && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-dark-muted">
                  <Calendar className="w-4 h-4" />
                  {title.year}
                </div>
              )}
              {title.episodes && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-dark-muted">
                  <BarChart3 className="w-4 h-4" />
                  {title.episodes} {dict.list.progress}
                </div>
              )}
              {title.duration && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-dark-muted">
                  <Clock className="w-4 h-4" />
                  {title.duration}
                </div>
              )}
              {title.studio && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-dark-muted">
                  <Building2 className="w-4 h-4" />
                  {title.studio}
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => {
                const cleanGenre = g.trim();
                const localizedGenre = dict.genres[cleanGenre] || cleanGenre;
                return (
                  <Link
                    key={cleanGenre}
                    href={`/browse?genre=${cleanGenre}`}
                    className="px-4 py-1.5 rounded-full text-xs font-medium bg-dark-surface border border-dark-border text-dark-muted hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
                  >
                    {localizedGenre}
                  </Link>
                );
              })}
            </div>

            {/* Description */}
            {title.description && (
              <p className="text-dark-text/80 leading-relaxed text-base">
                {title.description}
              </p>
            )}

            {/* Status buttons */}
            {isLoggedIn ? (
              <StatusButtons
                titleId={title.id}
                currentStatus={userEntry?.status}
              />
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-bg font-bold text-sm hover:opacity-90 transition-opacity"
              >
                {dict.details.saveToList}
              </Link>
            )}
          </motion.div>
        </div>

        {/* Trailer */}
        {youtubeId && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-neon-pink" />
              {dict.details.trailer}
            </h2>
            <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border border-dark-border neon-glow-pink">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Trailer"
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </motion.section>
        )}

        {/* Similar */}
        {similarTitles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 pb-12"
          >
            <h2 className="text-xl font-bold mb-6">{dict.details.similar}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarTitles.map((t, i) => (
                <TitleCard key={t.id} title={t} index={i} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Reviews Section */}
        <section className="mt-12 pb-24 max-w-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neon-cyan" /> 
            {dict.details.reviews} ({reviews.length})
          </h2>

          {isLoggedIn ? (
            <form onSubmit={handleReviewSubmit} className="mb-8 glass p-4 rounded-2xl border border-dark-border">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={dict.details.writeReview}
                className="w-full h-24 bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-sm focus:outline-none focus:border-neon-cyan/50 resize-none mb-3"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-dark-muted">
                  {userEntry?.score ? `${dict.list.score}: ${userEntry.score}/10` : ""}
                </span>
                <button 
                  type="submit" 
                  disabled={isPending || !reviewText.trim()}
                  className="px-6 py-2 bg-neon-cyan text-black font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> {isPending ? dict.common.loading : dict.details.submit}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 rounded-2xl glass border border-dark-border text-center">
              <p className="text-dark-muted text-sm mb-3">{dict.details.reviews}</p>
              <Link href="/login" className="text-neon-cyan font-bold text-sm hover:underline">{dict.nav.login}</Link>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-dark-muted text-center py-8">{dict.common.noResults}</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="p-4 rounded-2xl glass-strong border border-dark-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-dark-border overflow-hidden relative">
                      {review.user.image ? (
                         <Image src={review.user.image} alt="Avatar" fill className="object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-cyan to-neon-purple text-dark-bg font-bold">
                           {review.user.name?.[0]?.toUpperCase() || "U"}
                         </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{review.user.name || "Anon"}</div>
                      <div className="text-xs text-dark-muted">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                    {review.rating ? (
                      <div className="ml-auto flex items-center gap-1 text-neon-yellow">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold">{review.rating}</span>
                      </div>
                    ) : null}
                  </div>
                  <p className="text-sm text-dark-text/90 leading-relaxed whitespace-pre-wrap">
                    {review.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
