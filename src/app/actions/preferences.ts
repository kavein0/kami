"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n";
import { z } from "zod";

const languageSchema = z.enum(["ru", "en"]);

export async function setLanguage(lang: "ru" | "en") {
  languageSchema.parse(lang);
  const cookieStore = await cookies();
  cookieStore.set("miruverse-lang", lang, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  revalidatePath("/");
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const schema = z.object({
    name: z.string().min(1).max(100).trim(),
    bio: z.string().max(500).trim(),
    image: z.string().url().optional().or(z.literal("")),
  });

  const parsed = schema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") || "",
    image: formData.get("image") || "",
  });

  const dict = await getDictionary();

  if (!parsed.success) {
    return { error: dict.auth.errorGeneric };
  }

  const { name, bio, image } = parsed.data;

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
