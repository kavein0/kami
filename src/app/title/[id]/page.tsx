import { prisma } from "@/lib/prisma";
import { getTitleDetail, getSimilarTitles } from "@/lib/tmdb";
import { getAnimeDetail, getSimilarAnime } from "@/lib/jikan";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { TitleDetailClient } from "@/components/title-detail-client";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";

interface TitlePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TitlePageProps): Promise<Metadata> {
  const { id } = await params;
  let title;
  if (id.startsWith("jikan_") || id.startsWith("anime_")) {
    title = await getAnimeDetail(id);
  } else {
    title = await getTitleDetail(id);
  }
  if (!title) return { title: "Not Found — KamiList" };

  const baseUrl = process.env.NEXTAUTH_URL || "https://kamilist.vercel.app";
  const ogImageUrl = new URL("/api/og", baseUrl);
  ogImageUrl.searchParams.set("title", title.name);
  if (title.backdrop || title.poster) {
    ogImageUrl.searchParams.set("image", title.backdrop || title.poster || "");
  }

  return {
    title: `${title.name} — KamiList`,
    description: title.description || `${title.name} on KamiList`,
    openGraph: {
      title: `${title.name} — KamiList`,
      description: title.description || undefined,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: title.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title.name} — KamiList`,
      description: title.description || undefined,
      images: [ogImageUrl.toString()],
    },
  };
}

export default async function TitlePage({ params }: TitlePageProps) {
  const { id } = await params;
  const session = await auth();

  let title;
  if (id.startsWith("jikan_") || id.startsWith("anime_")) {
    title = await getAnimeDetail(id);
  } else {
    title = await getTitleDetail(id);
  }

  if (!title) notFound();

  let userEntry = null;
  if (session?.user?.id) {
    userEntry = await prisma.listEntry.findUnique({
      where: {
        userId_titleId: {
          userId: session.user.id,
          titleId: id,
        },
      },
    });
  }

  // Get similar titles (same type or genres)
  let similarTitles = [];
  if (id.startsWith("jikan_") || id.startsWith("anime_")) {
    similarTitles = await getSimilarAnime(id);
  } else {
    similarTitles = await getSimilarTitles(id);
  }

  // Get reviews
  const reviews = await prisma.review.findMany({
    where: { titleId: id },
    include: { user: { select: { name: true, image: true, id: true } } },
    orderBy: { createdAt: "desc" }
  });

  const dict = await getDictionary();

  // Fallback map legacy score extraction to malScore so old components don't visually break
  const malScore = title.type === "anime" ? title.rating : null;

  return (
    <TitleDetailClient
      title={title}
      userEntry={userEntry}
      similarTitles={similarTitles}
      isLoggedIn={!!session?.user}
      reviews={reviews}
      dict={dict}
      malScore={malScore}
    />
  );
}
