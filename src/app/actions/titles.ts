"use server";

import { fetchJikan } from "@/lib/jikan";
import { fetchTMDB } from "@/lib/tmdb";
import { redirect } from "next/navigation";

/**
 * Server action to find a random title ID across Anime, Movies, and TV.
 * Redirects the user to the title's detail page.
 */
export async function getRandomTitleAction() {
  // Types of titles to pick from
  const types = ["anime", "movie", "tv"];
  const selectedType = types[Math.floor(Math.random() * types.length)];

  let id = "";

  try {
    if (selectedType === "anime") {
      const data = await fetchJikan("/random/anime");
      if (data?.data?.mal_id) {
        id = `jikan_${data.data.mal_id}`;
      }
    } else {
      // For Movies and TV, we use TMDB discover.
      // We pick a random page from the top 100 to ensure quality (approx top 2000 titles).
      const randomPage = Math.floor(Math.random() * 50) + 1;
      const data = await fetchTMDB(`/discover/${selectedType}`, {
        page: randomPage.toString(),
        sort_by: "popularity.desc",
        "vote_count.gte": "100", // Basic quality filter
      });

      if (data?.results?.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const item = data.results[randomIndex];
        id = `${selectedType}_${item.id}`;
      }
    }

    if (id) {
      redirect(`/title/${id}`);
    }
  } catch (error) {
    // If redirect was called, it throws a specific error that Next.js catches
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Failed to fetch random title:", error);
    redirect("/"); // Fallback to home
  }
}
