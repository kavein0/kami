import { getDictionary } from "@/lib/i18n";
import { RegisterForm } from "@/components/auth/register-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  const dict = await getDictionary();

  return <RegisterForm dict={dict} />;
}
