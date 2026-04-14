"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTitleDetail } from "@/lib/tmdb";
import { getAnimeDetail } from "@/lib/jikan";
import { z } from "zod";

const addToListSchema = z.object({
  titleId: z.string().min(1),
  status: z.string().min(1),
});

const updateListEntrySchema = z.object({
  entryId: z.string().min(1),
  data: z.object({
    status: z.string().optional(),
    score: z.number().min(0).max(10).optional(),
    comment: z.string().max(1000).optional(),
    progress: z.number().min(0).optional(),
  }),
});

async function ensureTitleExists(titleId: string) {
  const localTitle = await prisma.title.findUnique({ where: { id: titleId } });
  if (localTitle) return;

  let titleData;
  if (titleId.startsWith("jikan_") || titleId.startsWith("anime_")) {
    titleData = await getAnimeDetail(titleId);
  } else {
    titleData = await getTitleDetail(titleId);
  }
  
  if (!titleData) throw new Error("Title not found");

  await prisma.title.create({
    data: {
      id: titleId,
      name: titleData.name,
      nameEn: titleData.nameEn,
      type: titleData.type,
      poster: titleData.poster,
      backdrop: titleData.backdrop,
      description: titleData.description,
      trailer: titleData.trailer,
      year: titleData.year,
      rating: titleData.rating,
      episodes: titleData.episodes,
      duration: titleData.duration,
      studio: titleData.studio,
      genres: titleData.genres,
      status: titleData.status,
      popularity: titleData.popularity,
    },
  });
}

export async function addToList(titleId: string, status: string) {
  const parsed = addToListSchema.safeParse({ titleId, status });
  if (!parsed.success) throw new Error("Invalid input");

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser) redirect("/logout");

  // Ensure title exists locally for foreign relationships
  await ensureTitleExists(parsed.data.titleId);

  const existing = await prisma.listEntry.findUnique({
    where: {
      userId_titleId: {
        userId: session.user.id,
        titleId: parsed.data.titleId,
      },
    },
  });

  if (existing) {
    await prisma.listEntry.update({
      where: { id: existing.id },
      data: { status: parsed.data.status },
    });
  } else {
    await prisma.listEntry.create({
      data: {
        userId: session.user.id,
        titleId: parsed.data.titleId,
        status: parsed.data.status,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/my-list");
  revalidatePath(`/title/${parsed.data.titleId}`);
}

export async function removeFromList(entryId: string) {
  z.string().min(1).parse(entryId);

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser) redirect("/logout");

  // Verify ownership before deleting
  const entry = await prisma.listEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== session.user.id) {
    throw new Error("Entry not found or access denied");
  }

  await prisma.listEntry.delete({
    where: { id: entryId },
  });

  revalidatePath("/");
  revalidatePath("/my-list");
}

export async function updateListEntry(
  entryId: string,
  data: { status?: string; score?: number; comment?: string; progress?: number }
) {
  const parsed = updateListEntrySchema.safeParse({ entryId, data });
  if (!parsed.success) throw new Error("Invalid input");

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser) redirect("/logout");

  // Verify ownership before updating
  const entry = await prisma.listEntry.findUnique({ where: { id: parsed.data.entryId } });
  if (!entry || entry.userId !== session.user.id) {
    throw new Error("Entry not found or access denied");
  }

  await prisma.listEntry.update({
    where: { id: parsed.data.entryId },
    data: parsed.data.data,
  });

  revalidatePath("/my-list");
}

export async function submitReview(titleId: string, content: string, rating: number) {
  const schema = z.object({
    titleId: z.string().min(1),
    content: z.string().min(1).max(5000),
    rating: z.number().min(1).max(10),
  });
  const parsed = schema.safeParse({ titleId, content, rating });
  if (!parsed.success) throw new Error("Invalid input");

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Ensure title exists locally for foreign relationships
  await ensureTitleExists(parsed.data.titleId);

  await prisma.review.create({
    data: {
      userId: session.user.id,
      titleId: parsed.data.titleId,
      content: parsed.data.content,
      rating: parsed.data.rating,
    }
  });

  revalidatePath(`/title/${parsed.data.titleId}`);
}
