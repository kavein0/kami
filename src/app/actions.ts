"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { signIn, signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTitleDetail, searchTitles, getPopularTitles } from "@/lib/tmdb";
import { ANIME_GENRES, MOVIE_GENRES, SERIES_GENRES, GenreConfig } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";

// ===== HELPERS =====

async function ensureTitleExists(titleId: string) {
  const localTitle = await prisma.title.findUnique({ where: { id: titleId } });
  if (localTitle) return;

  const tmdbData = await getTitleDetail(titleId);
  if (!tmdbData) throw new Error("Title not found");

  await prisma.title.create({
    data: {
      id: titleId,
      name: tmdbData.name,
      nameEn: tmdbData.nameEn,
      type: tmdbData.type,
      poster: tmdbData.poster,
      backdrop: tmdbData.backdrop,
      description: tmdbData.description,
      trailer: tmdbData.trailer,
      year: tmdbData.year,
      rating: tmdbData.rating,
      episodes: tmdbData.episodes,
      duration: tmdbData.duration,
      studio: tmdbData.studio,
      genres: tmdbData.genres,
      status: tmdbData.status,
      popularity: tmdbData.popularity,
    },
  });
}

// ===== AUTH ACTIONS =====

export async function registerAction(formData: FormData) {
  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;
  const dict = await getDictionary();

  if (!name || !email || !password) {
    return { error: dict.auth.errorGeneric };
  }

  if (password.length < 6) {
    return { error: dict.auth.passwordMin };
  }

  // Check unique name and email
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { name },
        { email }
      ]
    }
  });

  if (existingUser) {
    if (existingUser.name === name) return { error: dict.auth.errorNameExists };
    if (existingUser.email === email) return { error: dict.auth.errorEmailExists };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return { error: dict.auth.errorGeneric };
  }
}

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;
  const dict = await getDictionary();

  if (!email || !password) {
    return { error: dict.auth.errorGeneric };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "type" in error && (error as { type: string }).type === "CredentialsSignin") {
      return { error: "Invalid credentials" }; // Dictionary could have more specific auth error if added
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

// ===== LIST ACTIONS =====

export async function addToList(titleId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser) redirect("/logout");

  // Ensure title exists locally for foreign relationships
  await ensureTitleExists(titleId);

  const existing = await prisma.listEntry.findUnique({
    where: {
      userId_titleId: {
        userId: session.user.id,
        titleId,
      },
    },
  });

  if (existing) {
    await prisma.listEntry.update({
      where: { id: existing.id },
      data: { status },
    });
  } else {
    await prisma.listEntry.create({
      data: {
        userId: session.user.id,
        titleId,
        status,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/my-list");
  revalidatePath(`/title/${titleId}`);
}

export async function removeFromList(entryId: string) {
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
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser) redirect("/logout");

  // Verify ownership before updating
  const entry = await prisma.listEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== session.user.id) {
    throw new Error("Entry not found or access denied");
  }

  await prisma.listEntry.update({
    where: { id: entryId },
    data,
  });

  revalidatePath("/my-list");
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const name = (formData.get("name") as string || "").trim().slice(0, 100);
  const bio = (formData.get("bio") as string || "").trim().slice(0, 500);
  const image = formData.get("image") as string | null;
  const dict = await getDictionary();

  if (!name) return { error: dict.auth.errorGeneric };

  // Check if name is taken by another user
  const existing = await prisma.user.findFirst({
    where: {
      name,
      NOT: { id: session.user.id }
    }
  });

  if (existing) return { error: dict.auth.errorNameExists };

  const dataToUpdate: { name: string; bio: string; image?: string } = { name, bio };
  if (image && (image.startsWith("https://") || image.startsWith("http://"))) {
    dataToUpdate.image = image;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: dataToUpdate,
  });

  revalidatePath("/profile");
}

// ===== REVIEW ACTIONS =====

export async function submitReview(titleId: string, content: string, rating: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Ensure title exists locally for foreign relationships
  await ensureTitleExists(titleId);

  await prisma.review.create({
    data: {
      userId: session.user.id,
      titleId,
      content,
      rating,
    }
  });

  revalidatePath(`/title/${titleId}`);
}

// ===== TMDB ACTIONS =====

export async function loadMoreTitles(params: {
  page: number;
  q?: string;
  tab?: string;
  genre?: string;
  year?: string;
  sort?: string;
}) {
  const { page, q, tab, genre, year, sort } = params;
  let titles = [];

  if (q) {
    const res = await searchTitles(q, page);
    titles = res.results;
    if (tab === "anime") titles = titles.filter(t => t.type === "anime");
    if (tab === "movie") titles = titles.filter(t => t.type === "movie");
    if (tab === "series") titles = titles.filter(t => t.type === "series");
  } else {
    let genreConfig: GenreConfig | undefined;
    let fetchType: "tv" | "movie" = "movie";
    let isAnime = false;

    if (tab === "anime") {
        fetchType = "tv";
        isAnime = true;
        genreConfig = ANIME_GENRES.find(g => g.name === genre);
    } else if (tab === "series") {
        fetchType = "tv";
        genreConfig = SERIES_GENRES.find(g => g.name === genre);
    } else { 
        fetchType = "movie";
        genreConfig = MOVIE_GENRES.find(g => g.name === genre);
    }

    const sortConfig = 
      sort === "rating_desc" ? "vote_average.desc" : 
      sort === "date_desc" ? (fetchType === "tv" ? "first_air_date.desc" : "primary_release_date.desc") : 
      "popularity.desc";

    const res = await getPopularTitles(fetchType, {
        filterAnime: isAnime,
        page,
        genreId: genreConfig?.type === "genre" ? genreConfig.id : undefined,
        keywordId: genreConfig?.type === "keyword" ? genreConfig.id : undefined,
        sortBy: sortConfig,
    });
    titles = res.results;
  }

  if (year) {
    titles = titles.filter(t => t.year === parseInt(year));
  }

  return titles;
}

// ===== SOCIAL ACTIONS =====

export async function toggleFollow(targetUserId: string) {
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

// ===== LOCALIZATION ACTIONS =====

export async function setLanguage(lang: "ru" | "en") {
  const cookieStore = await cookies();
  cookieStore.set("kamilist-lang", lang, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  revalidatePath("/");
}

// ===== SOCIAL ACTIONS =====

export async function searchUsers(query: string) {
  const session = await auth();
  if (!session?.user?.id || !query) return [];

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
