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
  { id: 1, name: "Action", type: "genre", description: "Динамичные сцены, сражения и безостановочные действия." },
  { id: 2, name: "Adventure", type: "genre", description: "Путешествия, исследования новых миров и открытия." },
  { id: 5, name: "Avant Garde", type: "genre", description: "Нестандартное, экспериментальное искусство и сюжет." },
  { id: 46, name: "Award Winning", type: "genre", description: "Признанные критиками шедевры, получившие награды." },
  { id: 28, name: "Boys Love", type: "genre", description: "Романтические отношения между юношами." },
  { id: 4, name: "Comedy", type: "genre", description: "Юмор, шутки и легкая атмосфера для поднятия настроения." },
  { id: 8, name: "Drama", type: "genre", description: "Глубокие эмоции, конфликты и серьезные переживания героев." },
  { id: 9, name: "Ecchi", type: "genre", description: "Пикантные ситуации и акцент на привлекательности персонажей." },
  { id: 10, name: "Fantasy", type: "genre", description: "Магия, вымышленные вселенные и мифические существа." },
  { id: 26, name: "Girls Love", type: "genre", description: "Романтические отношения между девушками." },
  { id: 47, name: "Gourmet", type: "genre", description: "Фокус на вкусной еде, её приготовлении и кулинарных битвах." },
  { id: 14, name: "Horror", type: "genre", description: "Страшные, леденящие душу сюжеты и монстры." },
  { id: 7, name: "Mystery", type: "genre", description: "Загадки, расследования и необъяснимые явления." },
  { id: 22, name: "Romance", type: "genre", description: "Развитие любовных отношений и трепетных чувств персонажей." },
  { id: 24, name: "Sci-Fi", type: "genre", description: "Технологии будущего, космос и альтернативные реальности." },
  { id: 36, name: "Slice of Life", type: "genre", description: "Обычная жизнь героев с её маленькими радостями и проблемами." },
  { id: 30, name: "Sports", type: "genre", description: "Соревнования, тренировки и преодоление себя ради победы." },
  { id: 37, name: "Supernatural", type: "genre", description: "Призраки, духи и паранормальные способности в реальном мире." },
  { id: 41, name: "Suspense", type: "genre", description: "Напряжение, саспенс и неожиданные повороты сюжета." },
  { id: 50, name: "Adult Cast", type: "genre", description: "В центре сюжета — взрослые персонажи и их проблемы." },
  { id: 51, name: "Anthropomorphic", type: "genre", description: "Животные или неживые предметы, наделённые человеческими чертами." },
  { id: 52, name: "CGDCT", type: "genre", description: "Милые девочки делают милые вещи." },
  { id: 53, name: "Childcare", type: "genre", description: "Истории о воспитании детей и родительстве." },
  { id: 54, name: "Combat Sports", type: "genre", description: "Боевые виды спорта, турниры и единоборства." },
  { id: 81, name: "Crossdressing", type: "genre", description: "Персонажи, переодевающиеся в одежду другого пола." },
  { id: 55, name: "Delinquents", type: "genre", description: "Банды, уличные драки и школьные хулиганы." },
  { id: 39, name: "Detective", type: "genre", description: "Раскрытие преступлений и поиск истины." },
  { id: 56, name: "Educational", type: "genre", description: "Познавательные сюжеты, обучающие зрителя чему-то новому." },
  { id: 57, name: "Gag Humor", type: "genre", description: "Абсурдный комедийный юмор и гэги." },
  { id: 58, name: "Gore", type: "genre", description: "Много крови, крайней жестокости и насилия." },
  { id: 35, name: "Harem", type: "genre", description: "Главный герой окружён вниманием множества персонажей другого пола." },
  { id: 59, name: "High Stakes Game", type: "genre", description: "Азартные игры и турниры, где на кону стоит всё." },
  { id: 13, name: "Historical", type: "genre", description: "События происходят в прошлом, часто на фоне реальных исторических эпох." },
  { id: 60, name: "Idols (Female)", type: "genre", description: "Поп-идолы и их путь к славе на сцене." },
  { id: 61, name: "Idols (Male)", type: "genre", description: "Мужские группы идолов." },
  { id: 62, name: "Isekai", type: "genre", description: "Перерождение или попадание в совершенно другой мир." },
  { id: 63, name: "Iyashikei", type: "genre", description: "Расслабляющая, исцеляющая душу атмосфера." },
  { id: 64, name: "Love Polygon", type: "genre", description: "Сложные любовные многоугольники и интриги." },
  { id: 65, name: "Magical Sex Shift", type: "genre", description: "Магическая или физическая смена биологического пола героев." },
  { id: 66, name: "Mahou Shoujo", type: "genre", description: "Девочки-волшебницы, сражающиеся со злом." },
  { id: 17, name: "Martial Arts", type: "genre", description: "Зрелищные боевые искусства и духовное развитие." },
  { id: 18, name: "Mecha", type: "genre", description: "Сражения с использованием гигантских боевых пилотируемых роботов." },
  { id: 67, name: "Medical", type: "genre", description: "Врачи, больницы и лечение." },
  { id: 38, name: "Military", type: "genre", description: "Армия, война и военная тактика." },
  { id: 19, name: "Music", type: "genre", description: "Исполнение музыки и жизнь музыкантов." },
  { id: 6, name: "Mythology", type: "genre", description: "Основано на мифах, легендах и фольклоре." },
  { id: 68, name: "Organized Crime", type: "genre", description: "Якудза, мафия и организованная преступность." },
  { id: 69, name: "Otaku Culture", type: "genre", description: "Сюжет вращается вокруг аниме, манги и гик-культуры." },
  { id: 20, name: "Parody", type: "genre", description: "Пародии и отсылки на другие известные произведения." },
  { id: 70, name: "Performing Arts", type: "genre", description: "Театр, актерское мастерство и выступления." },
  { id: 71, name: "Pets", type: "genre", description: "Домашние животные в центре внимания." },
  { id: 40, name: "Psychological", type: "genre", description: "Игры разума, глубокие внутренние конфликты и анализ личности." },
  { id: 3, name: "Racing", type: "genre", description: "Уличные и профессиональные гонки." },
  { id: 72, name: "Reincarnation", type: "genre", description: "Перерождение в новом теле или времени." },
  { id: 73, name: "Reverse Harem", type: "genre", description: "Героиня в окружении множества влюблённых в неё парней." },
  { id: 74, name: "Romantic Subtext", type: "genre", description: "Лёгкие намёки на романтику без явного жанра." },
  { id: 21, name: "Samurai", type: "genre", description: "Самураи, катаны и кодекс чести в феодальной Японии." },
  { id: 23, name: "School", type: "genre", description: "Школьная жизнь и учёба." },
  { id: 75, name: "Showbiz", type: "genre", description: "Индустрия развлечений и шоу-бизнес за кулисами." },
  { id: 29, name: "Space", type: "genre", description: "Космические путешествия и битвы в других галактиках." },
  { id: 11, name: "Strategy Game", type: "genre", description: "Настольные или стратегические интеллектуальные игры." },
  { id: 31, name: "Super Power", type: "genre", description: "Сверхспособности, мутанты и герои." },
  { id: 76, name: "Survival", type: "genre", description: "Смертельные игры и выживание в суровых условиях." },
  { id: 77, name: "Team Sports", type: "genre", description: "Командный дух, дружба и спортивные состязания." },
  { id: 78, name: "Time Travel", type: "genre", description: "Путешествия во времени и изменение прошлого/будущего." },
  { id: 32, name: "Vampire", type: "genre", description: "Кровопийцы, бессмертные существа ночи и дракула." },
  { id: 79, name: "Video Game", type: "genre", description: "Сюжет разворачивается внутри видеоигры или вокруг неё." },
  { id: 80, name: "Villainess", type: "genre", description: "Главная героиня оказывается в роли злодейки в другом мире." },
  { id: 82, name: "Visual Arts", type: "genre", description: "Рисование, живопись и искусство." },
  { id: 83, name: "Workplace", type: "genre", description: "В центре сюжета рабочее место и профессиональна деятельность." }
];

export const MOVIE_GENRES: GenreConfig[] = [
  { id: 28, name: "Action", type: "genre", description: "Динамичные сцены, спецэффекты и постоянное действие." },
  { id: 12, name: "Adventure", type: "genre", description: "Приключения, опасные путешествия и открытия." },
  { id: 16, name: "Animation", type: "genre", description: "Мультипликация и анимационные работы." },
  { id: 35, name: "Comedy", type: "genre", description: "Смешные ситуации и юмор." },
  { id: 80, name: "Crime", type: "genre", description: "Преступный мир и расследования." },
  { id: 99, name: "Documentary", type: "genre", description: "Основано на реальных событиях и фактах." },
  { id: 18, name: "Drama", type: "genre", description: "Серьезные жизненные ситуации и переживания." },
  { id: 10751, name: "Family", type: "genre", description: "Подходит для просмотра с детьми." },
  { id: 14, name: "Fantasy", type: "genre", description: "Сказки, магия и вымышленные миры." },
  { id: 36, name: "History", type: "genre", description: "Важные исторические эпохи и личности." },
  { id: 27, name: "Horror", type: "genre", description: "Пугающая атмосфера, скримеры и страх." },
  { id: 10402, name: "Music", type: "genre", description: "Большую часть повествования занимают мюзиклы или концерты." },
  { id: 9648, name: "Mystery", type: "genre", description: "Загадочные дела и необъяснимые тайны." },
  { id: 10749, name: "Romance", type: "genre", description: "Сюжет о любви и отношениях двух людей." },
  { id: 878, name: "Science Fiction", type: "genre", description: "Наука, далекое будущее и высокие технологии." },
  { id: 10770, name: "TV Movie", type: "genre", description: "Фильм, созданный специально для телевидения." },
  { id: 53, name: "Thriller", type: "genre", description: "Напряжение, интрига и неожиданности." },
  { id: 10752, name: "War", type: "genre", description: "События разворачиваются во время боевых действий." },
  { id: 37, name: "Western", type: "genre", description: "Ковбои, Дикий Запад и перестрелки." }
];

export const SERIES_GENRES: GenreConfig[] = [
  { id: 10759, name: "Action & Adventure", type: "genre", description: "Совмещение динамичных боев с приключениями." },
  { id: 16, name: "Animation", type: "genre", description: "Анимационные многосерийные проекты." },
  { id: 35, name: "Comedy", type: "genre", description: "Ситкомы и комедийные сюжеты." },
  { id: 80, name: "Crime", type: "genre", description: "Криминал, мафия и полицейские расследования." },
  { id: 99, name: "Documentary", type: "genre", description: "Документально-образовательные циклы." },
  { id: 18, name: "Drama", type: "genre", description: "Драматические события и сложные отношения." },
  { id: 10751, name: "Family", type: "genre", description: "Сериалы для всей семьи." },
  { id: 10762, name: "Kids", type: "genre", description: "Мультсериалы и передачи для детей." },
  { id: 9648, name: "Mystery", type: "genre", description: "Тайны, детективы и расследования неизведанного." },
  { id: 10763, name: "News", type: "genre", description: "Новостные телепрограммы и трансляции." },
  { id: 10764, name: "Reality", type: "genre", description: "Реалити-шоу и проекты с участием обычных людей." },
  { id: 10765, name: "Sci-Fi & Fantasy", type: "genre", description: "Магия, вымышленные миры и наука." },
  { id: 10766, name: "Soap", type: "genre", description: "Мыльные оперы и длинные теленовеллы." },
  { id: 10767, name: "Talk", type: "genre", description: "Телевизионные ток-шоу с приглашенными гостями." },
  { id: 10768, name: "War & Politics", type: "genre", description: "Политика, война и государственные интриги." },
  { id: 37, name: "Western", type: "genre", description: "Дикий Запад, индейцы и ковбои." }
];
