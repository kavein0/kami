"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { getDictionary } from "@/lib/i18n";
import emailValidator from "deep-email-validator";
import { z } from "zod";
import { redirect } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
});

export async function registerAction(formData: FormData) {
  const dict = await getDictionary();

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: dict.auth.errorGeneric };
  }

  const { name, email, password } = parsed.data;

  if (password.length < 6) {
    return { error: dict.auth.passwordMin };
  }

  // Validate email thoroughly (MX records, typos, disposable domains)
  try {
    const emailValidation = await emailValidator({
      email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false, // SMTP checks are too slow and often blocked by Vercel
    });
    if (!emailValidation.valid) {
      return { error: dict.auth.errorEmailInvalid || "Invalid or disposable email address detected." };
    }
  } catch (err) {
    console.error("Email validation warning:", err);
    // Proceed if validation tool fails network request
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
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: dict.auth.errorGeneric };
  }
}

export async function loginAction(formData: FormData) {
  const dict = await getDictionary();

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: dict.auth.errorGeneric };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "type" in error && (error as { type: string }).type === "CredentialsSignin") {
      return { error: dict.auth.errorCredentials || "Invalid credentials" };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
