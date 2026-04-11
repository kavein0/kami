import { seedDatabase } from "@/lib/seed";
import { NextResponse } from "next/server";

export async function GET() {
  // Only allow seeding in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "Seeding is disabled in production" },
      { status: 403 }
    );
  }

  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: "Database seeded" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
