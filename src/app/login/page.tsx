import { getDictionary } from "@/lib/i18n";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  const dict = await getDictionary();

  return <LoginForm dict={dict} />;
}
