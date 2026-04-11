import { NextRequest, NextResponse } from "next/server";
import { searchTitles } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q) {
    return NextResponse.json({ titles: [] });
  }

  try {
    const res = await searchTitles(q, 1);
    // Take only the top 5 results for the dropdown
    return NextResponse.json({ titles: res.results.slice(0, 5) });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to search titles" }, { status: 500 });
  }
}
