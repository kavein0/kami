import { prisma } from "@/lib/prisma";

export interface SeedTitle {
  name: string;
  nameEn?: string;
  type: "anime" | "movie" | "series";
  poster: string;
  backdrop: string;
  description: string;
  trailer?: string;
  year: number;
  rating: number;
  episodes?: number;
  duration?: string;
  studio?: string;
  genres: string;
  status: string;
  popularity: number;
}

export const sampleTitles: SeedTitle[] = [
  {
    name: "Атака Титанов",
    nameEn: "Attack on Titan",
    type: "anime",
    poster: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    backdrop: "https://img.youtube.com/vi/MGRm4IzK1SQ/maxresdefault.jpg",
    description:
      "Человечество живёт за огромными стенами, спасаясь от гигантских существ — Титанов. Юный Эрен Йегер мечтает увидеть мир за стенами, но когда Титаны прорывают оборону, его жизнь меняется навсегда.",
    trailer: "https://www.youtube.com/watch?v=MGRm4IzK1SQ",
    year: 2013,
    rating: 9.0,
    episodes: 75,
    duration: "24 мин",
    studio: "MAPPA / Wit Studio",
    genres: "Экшен,Драма,Фэнтези,Тёмное фэнтези",
    status: "finished",
    popularity: 9800,
  },
  {
    name: "Тетрадь смерти",
    nameEn: "Death Note",
    type: "anime",
    poster: "https://cdn.myanimelist.net/images/anime/9/9453l.jpg",
    backdrop: "https://img.youtube.com/vi/NlJZ-YgAt-c/maxresdefault.jpg",
    description:
      "Старшеклассник Лайт Ягами находит тетрадь, принадлежащую богу смерти. Любой, чьё имя будет вписано в неё, умрёт. Лайт решает создать утопию, избавив мир от преступников.",
    trailer: "https://www.youtube.com/watch?v=NlJZ-YgAt-c",
    year: 2006,
    rating: 9.0,
    episodes: 37,
    duration: "23 мин",
    studio: "Madhouse",
    genres: "Триллер,Психологическое,Сверхъестественное",
    status: "finished",
    popularity: 9500,
  },
  {
    name: "Клинок, рассекающий демонов",
    nameEn: "Demon Slayer",
    type: "anime",
    poster: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    backdrop: "https://img.youtube.com/vi/VQGCKyvzIM4/maxresdefault.jpg",
    description:
      "Молодой Тандзиро Камадо становится охотником на демонов после того, как его семью убивают, а сестру превращают в демона. Он отправляется в путь, чтобы найти лекарство.",
    trailer: "https://www.youtube.com/watch?v=VQGCKyvzIM4",
    year: 2019,
    rating: 8.7,
    episodes: 44,
    duration: "24 мин",
    studio: "ufotable",
    genres: "Экшен,Фэнтези,Приключения",
    status: "airing",
    popularity: 9200,
  },
  {
    name: "Магическая Битва",
    nameEn: "Jujutsu Kaisen",
    type: "anime",
    poster: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    backdrop: "https://img.youtube.com/vi/4A_X-Dvl0ws/maxresdefault.jpg",
    description:
      "Юдзи Итадори, обычный старшеклассник с невероятной физической силой, оказывается втянут в мир проклятий после того, как проглатывает палец Короля Проклятий.",
    trailer: "https://www.youtube.com/watch?v=4A_X-Dvl0ws",
    year: 2020,
    rating: 8.8,
    episodes: 47,
    duration: "24 мин",
    studio: "MAPPA",
    genres: "Экшен,Сверхъестественное,Школа",
    status: "airing",
    popularity: 9100,
  },
  {
    name: "Ванпанчмен",
    nameEn: "One Punch Man",
    type: "anime",
    poster: "https://cdn.myanimelist.net/images/anime/12/76049l.jpg",
    backdrop: "https://img.youtube.com/vi/2JAElThbKrI/maxresdefault.jpg",
    description:
      "Сайтама — герой, который может уничтожить любого противника одним ударом. Но всемогущество принесло ему лишь скуку. Он ищет достойного противника.",
    trailer: "https://www.youtube.com/watch?v=2JAElThbKrI",
    year: 2015,
    rating: 8.5,
    episodes: 24,
    duration: "24 мин",
    studio: "Madhouse",
    genres: "Экшен,Комедия,Пародия",
    status: "finished",
    popularity: 8800,
  },
  {
    name: "Стальной Алхимик: Братство",
    nameEn: "Fullmetal Alchemist: Brotherhood",
    type: "anime",
    poster: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg",
    backdrop: "https://img.youtube.com/vi/--IcmZkvL0Q/maxresdefault.jpg",
    description:
      "Братья Эдвард и Альфонс Элрик занимаются алхимией, чтобы вернуть свои тела после неудачной попытки воскресить мать. Их путь ведёт к раскрытию тёмных тайн государства.",
    trailer: "https://www.youtube.com/watch?v=--IcmZkvL0Q",
    year: 2009,
    rating: 9.2,
    episodes: 64,
    duration: "24 мин",
    studio: "Bones",
    genres: "Экшен,Приключения,Фэнтези,Драма",
    status: "finished",
    popularity: 9600,
  },
  {
    name: "Наруто: Ураганные хроники",
    nameEn: "Naruto Shippuden",
    type: "anime",
    poster: "https://cdn.myanimelist.net/images/anime/5/17407l.jpg",
    backdrop: "https://img.youtube.com/vi/1dy2zME32X0/maxresdefault.jpg",
    description:
      "Наруто возвращается в Коноху после двух с половиной лет тренировок. Впереди — борьба с Акацуки и путь к мечте стать Хокаге.",
    trailer: "https://www.youtube.com/watch?v=1dy2zME32X0",
    year: 2007,
    rating: 8.3,
    episodes: 500,
    duration: "23 мин",
    studio: "Pierrot",
    genres: "Экшен,Приключения,Боевые искусства",
    status: "finished",
    popularity: 9400,
  },
  {
    name: "Твоё имя",
    nameEn: "Your Name",
    type: "movie",
    poster: "https://cdn.myanimelist.net/images/anime/5/87048l.jpg",
    backdrop: "https://img.youtube.com/vi/xU47nhruN-Q/maxresdefault.jpg",
    description:
      "Мицуха из деревни мечтает о жизни в Токио. Таки — токийский школьник. Однажды они начинают меняться телами. Романтическая история с захватывающим сюжетом.",
    trailer: "https://www.youtube.com/watch?v=xU47nhruN-Q",
    year: 2016,
    rating: 9.0,
    duration: "1 ч 46 мин",
    studio: "CoMix Wave Films",
    genres: "Романтика,Драма,Фэнтези",
    status: "finished",
    popularity: 9300,
  },
  {
    name: "Унесённые призраками",
    nameEn: "Spirited Away",
    type: "movie",
    poster: "https://cdn.myanimelist.net/images/anime/6/79597l.jpg",
    backdrop: "https://img.youtube.com/vi/ByXuk9QqQkk/maxresdefault.jpg",
    description:
      "Десятилетняя Тихиро попадает в мир духов и должна работать в купальне, чтобы спасти своих родителей, превращённых в свиней.",
    trailer: "https://www.youtube.com/watch?v=ByXuk9QqQkk",
    year: 2001,
    rating: 8.8,
    duration: "2 ч 5 мин",
    studio: "Studio Ghibli",
    genres: "Фэнтези,Приключения,Драма",
    status: "finished",
    popularity: 9100,
  },
  {
    name: "Ходячий замок",
    nameEn: "Howl's Moving Castle",
    type: "movie",
    poster: "https://cdn.myanimelist.net/images/anime/5/75810l.jpg",
    backdrop: "https://img.youtube.com/vi/iwROgK94zcM/maxresdefault.jpg",
    description:
      "Юная Софи превращена ведьмой в старуху и отправляется искать помощь у загадочного волшебника Хаула, живущего в ходячем замке.",
    trailer: "https://www.youtube.com/watch?v=iwROgK94zcM",
    year: 2004,
    rating: 8.7,
    duration: "1 ч 59 мин",
    studio: "Studio Ghibli",
    genres: "Фэнтези,Романтика,Приключения",
    status: "finished",
    popularity: 8900,
  },
  {
    name: "Охотник × Охотник",
    nameEn: "Hunter x Hunter (2011)",
    type: "anime",
    poster: "https://cdn.myanimelist.net/images/anime/1337/99013l.jpg",
    backdrop: "https://img.youtube.com/vi/d6kBeJjTGnY/maxresdefault.jpg",
    description:
      "Гон Фрикс отправляется на экзамен Охотников, чтобы найти своего отца. На пути он находит друзей и сталкивается со смертельными испытаниями.",
    trailer: "https://www.youtube.com/watch?v=d6kBeJjTGnY",
    year: 2011,
    rating: 9.1,
    episodes: 148,
    duration: "23 мин",
    studio: "Madhouse",
    genres: "Экшен,Приключения,Фэнтези",
    status: "finished",
    popularity: 9000,
  },
  {
    name: "Ковбой Бибоп",
    nameEn: "Cowboy Bebop",
    type: "anime",
    poster: "https://cdn.myanimelist.net/images/anime/4/19644l.jpg",
    backdrop: "https://img.youtube.com/vi/EL-D9LrFJd4/maxresdefault.jpg",
    description:
      "2071 год. Охотники за головами Спайк Шпигель и Джет Блэк путешествуют по космосу в поисках преступников. Стильный нуар с джазом.",
    trailer: "https://www.youtube.com/watch?v=EL-D9LrFJd4",
    year: 1998,
    rating: 8.8,
    episodes: 26,
    duration: "24 мин",
    studio: "Sunrise",
    genres: "Экшен,Sci-Fi,Драма",
    status: "finished",
    popularity: 8700,
  },
  {
    name: "Евангелион нового поколения",
    nameEn: "Neon Genesis Evangelion",
    type: "anime",
    poster: "https://cdn.myanimelist.net/images/anime/1314/108941l.jpg",
    backdrop: "https://img.youtube.com/vi/t-QSmNReDyI/maxresdefault.jpg",
    description:
      "14-летний Синдзи Икари пилотирует гигантского робота Евангелион, чтобы защитить Землю от вторжения Ангелов. Глубокое психологическое аниме.",
    trailer: "https://www.youtube.com/watch?v=t-QSmNReDyI",
    year: 1995,
    rating: 8.4,
    episodes: 26,
    duration: "24 мин",
    studio: "Gainax",
    genres: "Меха,Психологическое,Драма,Sci-Fi",
    status: "finished",
    popularity: 8600,
  },
  {
    name: "Начало",
    nameEn: "Inception",
    type: "movie",
    poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    backdrop: "https://img.youtube.com/vi/YoHD9XEInc0/maxresdefault.jpg",
    description:
      "Дом Кобб — мастер извлечения информации из снов. Ему предлагают невозможную миссию: внедрить идею в подсознание человека.",
    trailer: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    year: 2010,
    rating: 8.8,
    duration: "2 ч 28 мин",
    studio: "Warner Bros.",
    genres: "Sci-Fi,Триллер,Экшен",
    status: "finished",
    popularity: 9000,
  },
  {
    name: "Интерстеллар",
    nameEn: "Interstellar",
    type: "movie",
    poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    backdrop: "https://img.youtube.com/vi/zSWdZVtXT7E/maxresdefault.jpg",
    description:
      "Группа астронавтов отправляется через червоточину в поисках нового дома для человечества. Эпическая космическая одиссея Кристофера Нолана.",
    trailer: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    year: 2014,
    rating: 8.7,
    duration: "2 ч 49 мин",
    studio: "Paramount Pictures",
    genres: "Sci-Fi,Драма,Приключения",
    status: "finished",
    popularity: 9200,
  },
  {
    name: "Бегущий по лезвию 2049",
    nameEn: "Blade Runner 2049",
    type: "movie",
    poster: "https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_.jpg",
    backdrop: "https://img.youtube.com/vi/gCcx85zbxz4/maxresdefault.jpg",
    description:
      "Офицер LAPD K раскрывает тайну, которая может погрузить то, что осталось от человечества, в хаос. Визуально потрясающий сиквел культовой классики.",
    trailer: "https://www.youtube.com/watch?v=gCcx85zbxz4",
    year: 2017,
    rating: 8.0,
    duration: "2 ч 44 мин",
    studio: "Warner Bros.",
    genres: "Sci-Fi,Триллер,Драма",
    status: "finished",
    popularity: 8500,
  },
  {
    name: "Шпионская семейка",
    nameEn: "Spy x Family",
    type: "anime",
    poster: "https://cdn.myanimelist.net/images/anime/1441/139629l.jpg",
    backdrop: "https://img.youtube.com/vi/ofXigq9dHKA/maxresdefault.jpg",
    description:
      "Шпион должен создать фальшивую семью для миссии. Он не знает, что его «дочь» — телепат, а «жена» — убийца. Весёлый семейный экшен.",
    trailer: "https://www.youtube.com/watch?v=ofXigq9dHKA",
    year: 2022,
    rating: 8.6,
    episodes: 37,
    duration: "24 мин",
    studio: "Wit Studio / CloverWorks",
    genres: "Комедия,Экшен,Семейный",
    status: "airing",
    popularity: 8900,
  },
  {
    name: "Тихое место",
    nameEn: "A Silent Voice",
    type: "movie",
    poster: "https://cdn.myanimelist.net/images/anime/1122/96435l.jpg",
    backdrop: "https://img.youtube.com/vi/nfK6UgLra7g/maxresdefault.jpg",
    description:
      "Бывший школьный хулиган пытается искупить свою вину перед глухой девочкой, которую он травил. Эмоциональная драма о прощении.",
    trailer: "https://www.youtube.com/watch?v=nfK6UgLra7g",
    year: 2016,
    rating: 8.9,
    duration: "2 ч 10 мин",
    studio: "Kyoto Animation",
    genres: "Драма,Романтика,Школа",
    status: "finished",
    popularity: 8800,
  },
];

export async function seedDatabase() {
  const count = await prisma.title.count();
  if (count > 0) return;

  for (const title of sampleTitles) {
    await prisma.title.create({
      data: title,
    });
  }

  console.log(`Seeded ${sampleTitles.length} titles`);
}
