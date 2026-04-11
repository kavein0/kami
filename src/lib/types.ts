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
  { id: 10759, name: "Экшен", type: "genre", description: "Динамичные сцены, сражения и безостановочные действия." },
  { id: 10759, name: "Приключения", type: "genre", description: "Путешествия, исследования новых миров и открытия." },
  { id: 35, name: "Комедия", type: "genre", description: "Юмор, шутки и легкая атмосфера для поднятия настроения." },
  { id: 18, name: "Драма", type: "genre", description: "Глубокие эмоции, конфликты и серьезные переживания героев." },
  { id: 10749, name: "Романтика", type: "genre", description: "Развитие любовных отношений и трепетных чувств персонажей." },
  { id: 10765, name: "Фэнтези", type: "genre", description: "Магия, вымышленные вселенные и мифические существа." },
  { id: 10765, name: "Научная фантастика", type: "genre", description: "Технологии будущего, космос и альтернативные реальности." },
  { id: 27, name: "Ужасы", type: "genre", description: "Страшные, леденящие душу сюжеты и монстры." },
  { id: 9648, name: "Мистика", type: "genre", description: "Загадки, тайны и необъяснимые паранормальные явления." },
  { id: 316362, name: "Триллер", type: "keyword", description: "Напряжение, саспенс и неожиданные повороты сюжета." },
  { id: 9914, name: "Повседневность", type: "keyword", description: "Обычная жизнь героев с её маленькими радостями и проблемами." },
  { id: 6075, name: "Спорт", type: "keyword", description: "Соревнования, тренировки и преодоление себя ради победы." },
  { id: 6152, name: "Сверхъестественное", type: "keyword", description: "Призраки, духи и паранормальные способности в реальном мире." },
  { id: 10046, name: "Меха", type: "keyword", description: "Сражения с использованием гигантских боевых роботов." },
  { id: 237451, name: "Исекай", type: "keyword", description: "Попадание или перерождение героев в другом фэнтезийном мире." },
  { id: 272553, name: "Психологический", type: "keyword", description: "Игры разума, глубокие внутренние конфликты и анализ личности." },
  { id: 195669, name: "Этти", type: "keyword", description: "Пикантные ситуации и акцент на привлекательности персонажей." },
  { id: 207826, name: "Сёнэн", type: "keyword", description: "Аниме для юношей, часто с упором на экшен, дружбу и мотивацию." },
  { id: 206437, name: "Сёдзё", type: "keyword", description: "Аниме для девушек, часто с упором на романтику и отношения." },
  { id: 195668, name: "Сэйнэн", type: "keyword", description: "Аниме для мужчин, сложное, мрачное или реалистичное." },
  { id: 229074, name: "Дзёсэй", type: "keyword", description: "Аниме для женщин, обычно про повседневность и зрелую любовь." }
];

export const MOVIE_GENRES: GenreConfig[] = [
  { id: 28, name: "Боевик", type: "genre", description: "Динамичные сцены, спецэффекты и постоянное действие." },
  { id: 35, name: "Комедия", type: "genre", description: "Смешные ситуации и юмор." },
  { id: 18, name: "Драма", type: "genre", description: "Серьезные жизненные ситуации и переживания." },
  { id: 27, name: "Ужасы", type: "genre", description: "Пугающая атмосфера и страх." },
  { id: 878, name: "Фантастика", type: "genre", description: "Наука, будущее и технологии." },
  { id: 14, name: "Фэнтези", type: "genre", description: "Сказки, магия и вымышленные миры." },
  { id: 10749, name: "Мелодрама", type: "genre", description: "Отношения и любовь." },
  { id: 53, name: "Триллер", type: "genre", description: "Напряжение, интрига и неожиданности." },
  { id: 80, name: "Криминал", type: "genre", description: "Преступный мир и расследования." },
  { id: 9648, name: "Детектив", type: "genre", description: "Раскрытие тайн и убийств." }
];

export const SERIES_GENRES: GenreConfig[] = [
  { id: 10759, name: "Action & Adventure", type: "genre", description: "" },
  { id: 35, name: "Comedy", type: "genre", description: "" },
  { id: 18, name: "Drama", type: "genre", description: "" },
  { id: 10765, name: "Sci-Fi & Fantasy", type: "genre", description: "" },
  { id: 9648, name: "Mystery", type: "genre", description: "" },
  { id: 80, name: "Crime", type: "genre", description: "" }
];
