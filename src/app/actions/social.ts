"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function toggleFollow(targetUserId: string) {
  z.string().min(1).parse(targetUserId);

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.id === targetUserId) throw new Error("Cannot follow yourself");

  const existing = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId
      }
    }
  });

  if (existing) {
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId
        }
      }
    });
  } else {
    await prisma.follows.create({
      data: {
        followerId: session.user.id,
        followingId: targetUserId
      }
    });
  }

  revalidatePath(`/users/${targetUserId}`);
  revalidatePath(`/feed`);
}

export async function searchUsers(query: string) {
  z.string().min(1).parse(query);

  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.user.findMany({
    where: {
      name: { contains: query, mode: 'insensitive' },
      NOT: { id: session.user.id }
    },
    select: {
      id: true,
      name: true,
      image: true
    },
    take: 10
  });
}
