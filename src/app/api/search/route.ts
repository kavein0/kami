import { NextRequest, NextResponse } from "next/server";
import { searchTitles } from "@/lib/tmdb";
import { searchAnime } from "@/lib/jikan";
import { TitleData } from "@/lib/types";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q) {
    return NextResponse.json({ titles: [] });
  }

  try {
    // Run searches in parallel
    const [tmdbRes, jikanRes] = await Promise.all([
      searchTitles(q, 1),
      searchAnime(q, 1)
    ]);
    
    // Combine results
    const combined: TitleData[] = [];
    
    // Mix them dynamically, prioritizing exact matches if we had a sort algorithm, 
    // but for now we'll just interleave them or dump jikan first since it's an anime tracker mostly
    const maxLength = Math.max(tmdbRes.results.length, jikanRes.results.length);
    for (let i = 0; i < maxLength; i++) {
        if (jikanRes.results[i]) combined.push(jikanRes.results[i]);
        if (tmdbRes.results[i]) combined.push(tmdbRes.results[i]);
    }

    return NextResponse.json({ titles: combined.slice(0, 6) });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to search titles" }, { status: 500 });
  }
}
