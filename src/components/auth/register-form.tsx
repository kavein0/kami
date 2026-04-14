"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, UserPlus, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

interface Props {
  dict: any;
}

export function RegisterForm({ dict }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    if ((formData.get("password") as string).length < 6) {
      setError(dict.auth.passwordMin);
      setLoading(false);
      return;
    }

    try {
      const result = await registerAction(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.replace("/");
        router.refresh();
      }
    } catch {
      setError(dict.auth.errorGeneric);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-neon-purple/5 blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-neon-pink/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-strong rounded-3xl p-8 border border-dark-border shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 border border-neon-pink/20 mb-4"
            >
              <Sparkles className="w-8 h-8 text-neon-pink" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">{dict.auth.registerTitle}</h1>
            <p className="text-dark-muted text-sm mt-1">
              {dict.auth.registerSubtitle || "Join MiruVerse"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-dark-muted mb-2 uppercase tracking-wider">
                {dict.auth.name}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={dict.auth.name}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-surface border border-dark-border text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-dark-muted mb-2 uppercase tracking-wider">
                {dict.auth.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-surface border border-dark-border text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-dark-muted mb-2 uppercase tracking-wider">
                {dict.auth.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  placeholder={dict.auth.passwordMin}
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-dark-surface border border-dark-border text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-text"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 neon-glow-pink"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {dict.auth.submitRegister}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-dark-muted text-sm mt-6">
            {dict.auth.hasAccount}{" "}
            <Link
              href="/login"
              className="text-neon-cyan hover:underline font-medium"
            >
              {dict.nav.login}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
