"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";

interface Props {
  dict: Dictionary;
}

export function LoginForm({ dict }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await loginAction(formData);
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
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-cyan/5 blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-pink/5 blur-[120px]" />

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
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 mb-4"
            >
              <Sparkles className="w-8 h-8 text-neon-cyan" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">{dict.auth.loginTitle}</h1>
            <p className="text-dark-muted text-sm mt-1">
              {dict.auth.loginSubtitle || "Log in to your MiruVerse account"}
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
                  placeholder="••••••••"
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-bg font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 neon-glow-cyan"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {dict.auth.submitLogin}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-dark-muted text-sm mt-6">
            {dict.auth.noAccount}{" "}
            <Link
              href="/register"
              className="text-neon-cyan hover:underline font-medium"
            >
              {dict.auth.submitRegister}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
