export type TitleType = "anime" | "movie" | "series";

export type ListStatus =
  | "watched"
  | "watching"
  | "plan_to_watch"
  | "dropped"
  | "on_hold";

export interface TitleData {
  id: string;
  name: string;
  nameEn: string | null;
  type: string;
  poster: string | null;
  backdrop: string | null;
  description: string | null;
  trailer: string | null;
  year: number | null;
  rating: number | null;
  episodes: number | null;
  duration: string | null;
  studio: string | null;
  genres: string;
  status: string | null;
  popularity: number;
}

export interface ListEntryData {
  id: string;
  userId: string;
  titleId: string;
  status: string;
  score: number | null;
  comment: string | null;
  progress: number | null;
  createdAt: Date;
  updatedAt: Date;
  title: TitleData;
}

export interface UserStats {
  totalWatched: number;
  totalWatching: number;
  totalPlanToWatch: number;
  totalDropped: number;
  totalOnHold: number;
  averageScore: number;
  totalEntries: number;
}

export const STATUS_LABELS: Record<ListStatus, string> = {
  watched: "completed",
  watching: "watching",
  plan_to_watch: "planned",
  dropped: "dropped",
  on_hold: "onHold",
};

export const STATUS_COLORS: Record<ListStatus, string> = {
  watched: "#00f0ff",
  watching: "#00ff88",
  plan_to_watch: "#ffaa00",
  dropped: "#ff0055",
  on_hold: "#aa77ff",
};

export type GenreConfig = {
  id: number;
  name: string;
  type: "genre" | "keyword";
  description: string;
};

export const ANIME_GENRES: GenreConfig[] = [
  { id: 1, name: "Action", type: "genre", description: "" },
  { id: 2, name: "Adventure", type: "genre", description: "" },
  { id: 5, name: "Avant Garde", type: "genre", description: "" },
  { id: 46, name: "Award Winning", type: "genre", description: "" },
  { id: 28, name: "Boys Love", type: "genre", description: "" },
  { id: 4, name: "Comedy", type: "genre", description: "" },
  { id: 8, name: "Drama", type: "genre", description: "" },
  { id: 9, name: "Ecchi", type: "genre", description: "" },
  { id: 10, name: "Fantasy", type: "genre", description: "" },
  { id: 26, name: "Girls Love", type: "genre", description: "" },
  { id: 47, name: "Gourmet", type: "genre", description: "" },
  { id: 14, name: "Horror", type: "genre", description: "" },
  { id: 7, name: "Mystery", type: "genre", description: "" },
  { id: 22, name: "Romance", type: "genre", description: "" },
  { id: 24, name: "Sci-Fi", type: "genre", description: "" },
  { id: 36, name: "Slice of Life", type: "genre", description: "" },
  { id: 30, name: "Sports", type: "genre", description: "" },
  { id: 37, name: "Supernatural", type: "genre", description: "" },
  { id: 41, name: "Suspense", type: "genre", description: "" },
  { id: 50, name: "Adult Cast", type: "genre", description: "" },
  { id: 51, name: "Anthropomorphic", type: "genre", description: "" },
  { id: 52, name: "CGDCT", type: "genre", description: "" },
  { id: 53, name: "Childcare", type: "genre", description: "" },
  { id: 54, name: "Combat Sports", type: "genre", description: "" },
  { id: 81, name: "Crossdressing", type: "genre", description: "" },
  { id: 55, name: "Delinquents", type: "genre", description: "" },
  { id: 39, name: "Detective", type: "genre", description: "" },
  { id: 56, name: "Educational", type: "genre", description: "" },
  { id: 57, name: "Gag Humor", type: "genre", description: "" },
  { id: 58, name: "Gore", type: "genre", description: "" },
  { id: 35, name: "Harem", type: "genre", description: "" },
  { id: 59, name: "High Stakes Game", type: "genre", description: "" },
  { id: 13, name: "Historical", type: "genre", description: "" },
  { id: 60, name: "Idols (Female)", type: "genre", description: "" },
  { id: 61, name: "Idols (Male)", type: "genre", description: "" },
  { id: 62, name: "Isekai", type: "genre", description: "" },
  { id: 63, name: "Iyashikei", type: "genre", description: "" },
  { id: 64, name: "Love Polygon", type: "genre", description: "" },
  { id: 65, name: "Magical Sex Shift", type: "genre", description: "" },
  { id: 66, name: "Mahou Shoujo", type: "genre", description: "" },
  { id: 17, name: "Martial Arts", type: "genre", description: "" },
  { id: 18, name: "Mecha", type: "genre", description: "" },
  { id: 67, name: "Medical", type: "genre", description: "" },
  { id: 38, name: "Military", type: "genre", description: "" },
  { id: 19, name: "Music", type: "genre", description: "" },
  { id: 6, name: "Mythology", type: "genre", description: "" },
  { id: 68, name: "Organized Crime", type: "genre", description: "" },
  { id: 69, name: "Otaku Culture", type: "genre", description: "" },
  { id: 20, name: "Parody", type: "genre", description: "" },
  { id: 70, name: "Performing Arts", type: "genre", description: "" },
  { id: 71, name: "Pets", type: "genre", description: "" },
  { id: 40, name: "Psychological", type: "genre", description: "" },
  { id: 3, name: "Racing", type: "genre", description: "" },
  { id: 72, name: "Reincarnation", type: "genre", description: "" },
  { id: 73, name: "Reverse Harem", type: "genre", description: "" },
  { id: 74, name: "Romantic Subtext", type: "genre", description: "" },
  { id: 21, name: "Samurai", type: "genre", description: "" },
  { id: 23, name: "School", type: "genre", description: "" },
  { id: 75, name: "Showbiz", type: "genre", description: "" },
  { id: 29, name: "Space", type: "genre", description: "" },
  { id: 11, name: "Strategy Game", type: "genre", description: "" },
  { id: 31, name: "Super Power", type: "genre", description: "" },
  { id: 76, name: "Survival", type: "genre", description: "" },
  { id: 77, name: "Team Sports", type: "genre", description: "" },
  { id: 78, name: "Time Travel", type: "genre", description: "" },
  { id: 32, name: "Vampire", type: "genre", description: "" },
  { id: 79, name: "Video Game", type: "genre", description: "" },
  { id: 80, name: "Villainess", type: "genre", description: "" },
  { id: 82, name: "Visual Arts", type: "genre", description: "" },
  { id: 83, name: "Workplace", type: "genre", description: "" }
];

export const MOVIE_GENRES: GenreConfig[] = [
  { id: 28, name: "Action", type: "genre", description: "" },
  { id: 12, name: "Adventure", type: "genre", description: "" },
  { id: 16, name: "Animation", type: "genre", description: "" },
  { id: 35, name: "Comedy", type: "genre", description: "" },
  { id: 80, name: "Crime", type: "genre", description: "" },
  { id: 99, name: "Documentary", type: "genre", description: "" },
  { id: 18, name: "Drama", type: "genre", description: "" },
  { id: 10751, name: "Family", type: "genre", description: "" },
  { id: 14, name: "Fantasy", type: "genre", description: "" },
  { id: 36, name: "History", type: "genre", description: "" },
  { id: 27, name: "Horror", type: "genre", description: "" },
  { id: 10402, name: "Music", type: "genre", description: "" },
  { id: 9648, name: "Mystery", type: "genre", description: "" },
  { id: 10749, name: "Romance", type: "genre", description: "" },
  { id: 878, name: "Science Fiction", type: "genre", description: "" },
  { id: 10770, name: "TV Movie", type: "genre", description: "" },
  { id: 53, name: "Thriller", type: "genre", description: "" },
  { id: 10752, name: "War", type: "genre", description: "" },
  { id: 37, name: "Western", type: "genre", description: "" }
];

export const SERIES_GENRES: GenreConfig[] = [
  { id: 10759, name: "Action & Adventure", type: "genre", description: "" },
  { id: 16, name: "Animation", type: "genre", description: "" },
  { id: 35, name: "Comedy", type: "genre", description: "" },
  { id: 80, name: "Crime", type: "genre", description: "" },
  { id: 99, name: "Documentary", type: "genre", description: "" },
  { id: 18, name: "Drama", type: "genre", description: "" },
  { id: 10751, name: "Family", type: "genre", description: "" },
  { id: 10762, name: "Kids", type: "genre", description: "" },
  { id: 9648, name: "Mystery", type: "genre", description: "" },
  { id: 10763, name: "News", type: "genre", description: "" },
  { id: 10764, name: "Reality", type: "genre", description: "" },
  { id: 10765, name: "Sci-Fi & Fantasy", type: "genre", description: "" },
  { id: 10766, name: "Soap", type: "genre", description: "" },
  { id: 10767, name: "Talk", type: "genre", description: "" },
  { id: 10768, name: "War & Politics", type: "genre", description: "" },
  { id: 37, name: "Western", type: "genre", description: "" }
];
