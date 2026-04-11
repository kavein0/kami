import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MyListClient } from "@/components/my-list-client";
import { getDictionary } from "@/lib/i18n";

export default async function MyListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) {
    redirect("/logout");
  }

  const entries = await prisma.listEntry.findMany({
    where: { userId: session.user.id },
    include: { title: true },
    orderBy: { updatedAt: "desc" },
  });

  const dict = await getDictionary();

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="mx-auto px-4 sm:px-6 h-full flex flex-col">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">
          <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            {dict.list.title}
          </span>
        </h1>
        <div className="flex-1 min-h-[70vh]">
          <MyListClient 
            entries={JSON.parse(JSON.stringify(entries))} 
            dict={dict.list}
          />
        </div>
      </div>
    </div>
  );
}
