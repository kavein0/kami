import { prisma } from "@/lib/prisma";
import { getTitleDetail, getSimilarTitles } from "@/lib/tmdb";
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
  const title = await getTitleDetail(id);
  if (!title) return { title: "Not Found — KamiList" };

  return {
    title: `${title.name} — KamiList`,
    description: title.description || `${title.name} on KamiList`,
    openGraph: {
      title: `${title.name} — KamiList`,
      description: title.description || undefined,
      images: title.poster ? [{ url: title.poster }] : undefined,
    },
  };
}

export default async function TitlePage({ params }: TitlePageProps) {
  const { id } = await params;
  const session = await auth();

  const title = await getTitleDetail(id);

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
  const similarTitles = await getSimilarTitles(id);

  // Get reviews
  const reviews = await prisma.review.findMany({
    where: { titleId: id },
    include: { user: { select: { name: true, image: true, id: true } } },
    orderBy: { createdAt: "desc" }
  });

  const dict = await getDictionary();

  return (
    <TitleDetailClient
      title={title}
      userEntry={userEntry}
      similarTitles={similarTitles}
      isLoggedIn={!!session?.user}
      reviews={reviews}
      dict={dict}
    />
  );
}
