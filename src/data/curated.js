const IMG = "https://image.tmdb.org/t/p/w500";

export const MOVIE_COLLECTIONS = [
  {
    name: "Harry Potter",
    movies: [
      { title: "Philosopher's Stone", year: 2001, tmdbId: 671, poster: `${IMG}/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg` },
      { title: "Chamber of Secrets", year: 2002, tmdbId: 672, poster: `${IMG}/sdEOH0992YZ0QSxgXNIGLq1ToUi.jpg` },
      { title: "Prisoner of Azkaban", year: 2004, tmdbId: 673, poster: `${IMG}/aWxwnYoe8p2d2fcxOqtvAtJ72Rw.jpg` },
      { title: "Goblet of Fire", year: 2005, tmdbId: 674, poster: `${IMG}/fEZpFGpOELhGQ3jZRb5TiDIyzOA.jpg` },
      { title: "Order of the Phoenix", year: 2007, tmdbId: 675, poster: `${IMG}/s836PRwHkp6rovxKKwVEqfLRcaD.jpg` },
      { title: "Half-Blood Prince", year: 2009, tmdbId: 767, poster: `${IMG}/o2j4sHMiDGE7NjLHjYiMRqWoCOv.jpg` },
      { title: "Deathly Hallows Part 1", year: 2010, tmdbId: 12444, poster: `${IMG}/iGoXIpQb7Pot00EEdwpwPajheZ5.jpg` },
      { title: "Deathly Hallows Part 2", year: 2011, tmdbId: 12445, poster: `${IMG}/c54HpQmuwXjHq2C9wmoACjxoomG.jpg` },
    ],
  },
  {
    name: "The Lord of the Rings",
    movies: [
      { title: "The Fellowship of the Ring", year: 2001, tmdbId: 120, poster: `${IMG}/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg` },
      { title: "The Two Towers", year: 2002, tmdbId: 121, poster: `${IMG}/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg` },
      { title: "The Return of the King", year: 2003, tmdbId: 122, poster: `${IMG}/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg` },
    ],
  },
  {
    name: "The Dark Knight Trilogy",
    movies: [
      { title: "Batman Begins", year: 2005, tmdbId: 272, poster: `${IMG}/8RW2runSEc34IwKN2D1aPcJd2UL.jpg` },
      { title: "The Dark Knight", year: 2008, tmdbId: 155, poster: `${IMG}/qJ2tW6WMUDux911BTUgMe9YW.jpg` },
      { title: "The Dark Knight Rises", year: 2012, tmdbId: 49026, poster: `${IMG}/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg` },
    ],
  },
  {
    name: "John Wick",
    movies: [
      { title: "John Wick", year: 2014, tmdbId: 245891, poster: `${IMG}/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg` },
      { title: "Chapter 2", year: 2017, tmdbId: 324552, poster: `${IMG}/hXWBc0ioZP3cN4zCzZvQ3OM9eUi.jpg` },
      { title: "Chapter 3 – Parabellum", year: 2019, tmdbId: 458156, poster: `${IMG}/ziEGdwTUakKgiKSgjoJJ2aWSGMD.jpg` },
      { title: "Chapter 4", year: 2023, tmdbId: 603692, poster: `${IMG}/vZloFAK7NmvMGKE7Q2KHnMRFSGU.jpg` },
    ],
  },
  {
    name: "Spider-Man (MCU)",
    movies: [
      { title: "Homecoming", year: 2017, tmdbId: 315635, poster: `${IMG}/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg` },
      { title: "Far From Home", year: 2019, tmdbId: 429617, poster: `${IMG}/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg` },
      { title: "No Way Home", year: 2021, tmdbId: 634649, poster: `${IMG}/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg` },
    ],
  },
  {
    name: "The Matrix",
    movies: [
      { title: "The Matrix", year: 1999, tmdbId: 603, poster: `${IMG}/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg` },
      { title: "Reloaded", year: 2003, tmdbId: 604, poster: `${IMG}/9TGHDvWrqKBzwDxDSrq3nRGa0s0.jpg` },
      { title: "Revolutions", year: 2003, tmdbId: 605, poster: `${IMG}/t1wm4PgOQ8e4z1C6tk1rAoK8Hhi.jpg` },
      { title: "Resurrections", year: 2021, tmdbId: 624860, poster: `${IMG}/8c4a8kE7PizaGQQnditMmI1xPRp.jpg` },
    ],
  },
  {
    name: "Avengers",
    movies: [
      { title: "The Avengers", year: 2012, tmdbId: 24428, poster: `${IMG}/RYMX2wcKCBAr24UyPD7xwmhMm62.jpg` },
      { title: "Age of Ultron", year: 2015, tmdbId: 99861, poster: `${IMG}/4ssDuvEDkSArWEdyBl2X5EHvYKU.jpg` },
      { title: "Infinity War", year: 2018, tmdbId: 299536, poster: `${IMG}/7WsyChQLEftFiDhRkZmHsm0mNbH.jpg` },
      { title: "Endgame", year: 2019, tmdbId: 299534, poster: `${IMG}/or06FN3Dka5tukK1e9GDTIrGTds.jpg` },
    ],
  },
  {
    name: "Spider-Verse",
    movies: [
      { title: "Into the Spider-Verse", year: 2018, tmdbId: 324857, poster: `${IMG}/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg` },
      { title: "Across the Spider-Verse", year: 2023, tmdbId: 569094, poster: `${IMG}/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg` },
    ],
  },
  {
    name: "Dune",
    movies: [
      { title: "Dune", year: 2021, tmdbId: 438631, poster: `${IMG}/d5NXSklXo0qyIYkgV94XAgMIckC.jpg` },
      { title: "Dune: Part Two", year: 2024, tmdbId: 693134, poster: `${IMG}/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg` },
    ],
  },
  {
    name: "The Godfather",
    movies: [
      { title: "The Godfather", year: 1972, tmdbId: 238, poster: `${IMG}/3bhkrj58Vtu7enYsRolD1fZdja1.jpg` },
      { title: "Part II", year: 1974, tmdbId: 240, poster: `${IMG}/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg` },
      { title: "Part III", year: 1990, tmdbId: 242, poster: `${IMG}/lm3pQ2QoQ16pextRsmnUbG2onES.jpg` },
    ],
  },
  {
    name: "Mad Max",
    movies: [
      { title: "Fury Road", year: 2015, tmdbId: 76341, poster: `${IMG}/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg` },
      { title: "Furiosa", year: 2024, tmdbId: 786892, poster: `${IMG}/iADOJ8Zymht2JPMoy3R7xceZprc.jpg` },
    ],
  },
];

export const TOP_MOVIES = [
  { title: "Dune: Part Two", year: 2024, tmdbId: 693134, genre: "Sci-Fi", rating: "8.5", poster: `${IMG}/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg` },
  { title: "Oppenheimer", year: 2023, tmdbId: 872585, genre: "Drama", rating: "8.3", poster: `${IMG}/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg` },
  { title: "Spider-Man: Across the Spider-Verse", year: 2023, tmdbId: 569094, genre: "Animation", rating: "8.7", poster: `${IMG}/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg` },
  { title: "Everything Everywhere All at Once", year: 2022, tmdbId: 545611, genre: "Sci-Fi", rating: "8.0", poster: `${IMG}/w3LxiVYdWWRvEVdn5RYq6jIqkb6.jpg` },
  { title: "The Batman", year: 2022, tmdbId: 414906, genre: "Action", rating: "7.7", poster: `${IMG}/74xTEgt7R36Fpooo50r9T25onhq.jpg` },
  { title: "Top Gun: Maverick", year: 2022, tmdbId: 361743, genre: "Action", rating: "8.2", poster: `${IMG}/62HCnUTziyWQb9QfRsSs1XSRn09.jpg` },
  { title: "Avengers: Endgame", year: 2019, tmdbId: 299534, genre: "Action", rating: "8.4", poster: `${IMG}/or06FN3Dka5tukK1e9GDTIrGTds.jpg` },
  { title: "Joker", year: 2019, tmdbId: 475557, genre: "Drama", rating: "8.4", poster: `${IMG}/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg` },
  { title: "Parasite", year: 2019, tmdbId: 496243, genre: "Thriller", rating: "8.5", poster: `${IMG}/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg` },
  { title: "Inception", year: 2010, tmdbId: 27205, genre: "Sci-Fi", rating: "8.8", poster: `${IMG}/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg` },
  { title: "Interstellar", year: 2014, tmdbId: 157336, genre: "Sci-Fi", rating: "8.7", poster: `${IMG}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg` },
  { title: "The Dark Knight", year: 2008, tmdbId: 155, genre: "Action", rating: "9.0", poster: `${IMG}/qJ2tW6WMUDux911BTUgMe9YW.jpg` },
  { title: "The Shawshank Redemption", year: 1994, tmdbId: 278, genre: "Drama", rating: "9.3", poster: `${IMG}/9cjIGRjYBfDXvUQZTR4ZsEi4Mfm.jpg` },
  { title: "Pulp Fiction", year: 1994, tmdbId: 680, genre: "Crime", rating: "8.9", poster: `${IMG}/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg` },
  { title: "Fight Club", year: 1999, tmdbId: 550, genre: "Drama", rating: "8.8", poster: `${IMG}/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg` },
  { title: "Spirited Away", year: 2001, tmdbId: 129, genre: "Animation", rating: "8.6", poster: `${IMG}/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg` },
  { title: "Your Name", year: 2016, tmdbId: 372058, genre: "Animation", rating: "8.6", poster: `${IMG}/q719jXXEzOoYaps6babgKnONONX.jpg` },
  { title: "Whiplash", year: 2014, tmdbId: 244786, genre: "Drama", rating: "8.5", poster: `${IMG}/7fn624j5lj3xTme2SgiLCeuedmO.jpg` },
  { title: "The Lord of the Rings: Return of the King", year: 2003, tmdbId: 122, genre: "Fantasy", rating: "9.0", poster: `${IMG}/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg` },
  { title: "Gladiator", year: 2000, tmdbId: 98, genre: "Action", rating: "8.5", poster: `${IMG}/ty8TGRuvJLPUmAR1H1nRIsgpvim.jpg` },
];

export const TOP_TV_SHOWS = [
  { title: "Breaking Bad", year: 2008, tmdbId: 1396, genre: "Crime", rating: "9.5", seasons: 5, poster: `${IMG}/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg` },
  { title: "Game of Thrones", year: 2011, tmdbId: 1399, genre: "Fantasy", rating: "9.3", seasons: 8, poster: `${IMG}/1XS1oqL89opfnV0O0EixjBRo6B8.jpg` },
  { title: "The Last of Us", year: 2023, tmdbId: 100088, genre: "Drama", rating: "8.8", seasons: 2, poster: `${IMG}/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg` },
  { title: "Shogun", year: 2024, tmdbId: 126308, genre: "Drama", rating: "8.7", seasons: 1, poster: `${IMG}/7O4iVfOMQmdCSxhOg1WnzG1AgmX.jpg` },
  { title: "Stranger Things", year: 2016, tmdbId: 66732, genre: "Sci-Fi", rating: "8.7", seasons: 4, poster: `${IMG}/49WJfeN0moxb9IPfGn8AIqMGskD.jpg` },
  { title: "The Boys", year: 2019, tmdbId: 76479, genre: "Action", rating: "8.7", seasons: 4, poster: `${IMG}/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg` },
  { title: "Dark", year: 2017, tmdbId: 70523, genre: "Sci-Fi", rating: "8.8", seasons: 3, poster: `${IMG}/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg` },
  { title: "House of the Dragon", year: 2022, tmdbId: 94997, genre: "Fantasy", rating: "8.4", seasons: 2, poster: `${IMG}/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg` },
  { title: "Arcane", year: 2021, tmdbId: 94605, genre: "Animation", rating: "9.0", seasons: 2, poster: `${IMG}/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg` },
  { title: "Severance", year: 2022, tmdbId: 95396, genre: "Sci-Fi", rating: "8.7", seasons: 2, poster: `${IMG}/lFf6LLrQjYZMOqVhjx2jHXjyCLk.jpg` },
  { title: "Better Call Saul", year: 2015, tmdbId: 60059, genre: "Crime", rating: "8.9", seasons: 6, poster: `${IMG}/fC2HDm5t0kHagfiTRx5Ub8x8Asg.jpg` },
  { title: "Chernobyl", year: 2019, tmdbId: 87108, genre: "Drama", rating: "9.4", seasons: 1, poster: `${IMG}/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg` },
  { title: "Peaky Blinders", year: 2013, tmdbId: 60574, genre: "Crime", rating: "8.8", seasons: 6, poster: `${IMG}/vUUqzWa2LnHIVqkaKJBuQ7MRrjL.jpg` },
  { title: "Attack on Titan", year: 2013, tmdbId: 1429, genre: "Animation", rating: "9.1", seasons: 4, poster: `${IMG}/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg` },
  { title: "Death Note", year: 2006, tmdbId: 13916, genre: "Animation", rating: "9.0", seasons: 1, poster: `${IMG}/g8fclEHOeesMnBFwVkx5x0FZbfn.jpg` },
];

export const HINDI_WEB_SERIES = [
  { title: "Panchayat", year: 2020, tmdbId: 101578, genre: "Comedy, Drama", rating: "9.0", seasons: 3, poster: `${IMG}/kVelUaGOqNos2RA5cJmWMpQFcz5.jpg` },
  { title: "Mirzapur", year: 2018, tmdbId: 79744, genre: "Crime, Thriller", rating: "8.5", seasons: 3, poster: `${IMG}/bHa7M5XfCYyKKhVc5lqorv0dqho.jpg` },
  { title: "The Family Man", year: 2019, tmdbId: 93484, genre: "Action, Thriller", rating: "8.7", seasons: 2, poster: `${IMG}/tVikExKwPhOahYjpOzuSi5nYskz.jpg` },
  { title: "Sacred Games", year: 2018, tmdbId: 79352, genre: "Crime, Thriller", rating: "8.6", seasons: 2, poster: `${IMG}/pSxBKQLYbIMG0yIlAfDZwtBFSBN.jpg` },
  { title: "Kota Factory", year: 2019, tmdbId: 92785, genre: "Drama", rating: "9.1", seasons: 2, poster: `${IMG}/7hEb15JWjlDhJoRD7clxZPCL3My.jpg` },
  { title: "Aspirants", year: 2021, tmdbId: 125988, genre: "Drama", rating: "9.2", seasons: 2, poster: `${IMG}/4G5q7OiDRfBfjGu8TGrVPzSgVvA.jpg` },
  { title: "Scam 1992", year: 2020, tmdbId: 110316, genre: "Crime, Drama", rating: "9.3", seasons: 1, poster: `${IMG}/vbg6yYDXhiCaGunFHeSP2dRfzAI.jpg` },
  { title: "Paatal Lok", year: 2020, tmdbId: 99966, genre: "Crime, Thriller", rating: "8.3", seasons: 2, poster: `${IMG}/9dOjTiIwNaGT4XhLseDy4hb6VHu.jpg` },
  { title: "Delhi Crime", year: 2019, tmdbId: 88040, genre: "Crime, Drama", rating: "8.5", seasons: 2, poster: `${IMG}/dXFuzQc5GkCimi1LpJdZFb5YGWM.jpg` },
  { title: "Made in Heaven", year: 2019, tmdbId: 87481, genre: "Drama", rating: "8.3", seasons: 2, poster: `${IMG}/b7C6s7a4RHYBxYBLTAp3k0i9Xkz.jpg` },
  { title: "Breathe: Into the Shadows", year: 2020, tmdbId: 105236, genre: "Thriller", rating: "7.5", seasons: 2, poster: `${IMG}/rJvTBKisMByOwjr0WqfnvXlNr17.jpg` },
  { title: "Asur", year: 2020, tmdbId: 100770, genre: "Crime, Thriller", rating: "8.4", seasons: 2, poster: `${IMG}/ddp18oCedJZYh1VCGxzcnhLhJi9.jpg` },
  { title: "Rocket Boys", year: 2022, tmdbId: 154834, genre: "Drama, History", rating: "8.7", seasons: 2, poster: `${IMG}/f5OjxhJhDBOYpWTDzKgjVlSpQy8.jpg` },
  { title: "Gullak", year: 2019, tmdbId: 97186, genre: "Comedy, Drama", rating: "9.0", seasons: 4, poster: `${IMG}/6P5OxvVFobUiCjAZkVgtbZ8NVWK.jpg` },
  { title: "Hostel Daze", year: 2019, tmdbId: 97534, genre: "Comedy", rating: "8.2", seasons: 4, poster: `${IMG}/bWdNgcFhJvMbYUJZMXlqFbDPNfX.jpg` },
  { title: "Criminal Justice", year: 2019, tmdbId: 90690, genre: "Crime, Drama", rating: "8.0", seasons: 3, poster: `${IMG}/oy03CmFhcXzBEqzBqzNqfnx73jf.jpg` },
  { title: "Tandav", year: 2021, tmdbId: 114963, genre: "Drama, Thriller", rating: "6.5", seasons: 1, poster: `${IMG}/fLJ8qn3cRKdq4l3lJNa0R0nVaGj.jpg` },
  { title: "Maharani", year: 2021, tmdbId: 125343, genre: "Drama, Political", rating: "8.0", seasons: 3, poster: `${IMG}/2bDSPFwkkt4zIjV1VNJNRvGelkD.jpg` },
];

export const CHARTS = [
  { key: "hindi", title: "Hindi Web Series", icon: "flag-outline", color: "#f97316", description: "Top rated Indian shows" },
  { key: "topMovies", title: "Top Rated Movies", icon: "film-outline", color: "#3b82f6", description: "All-time best movies" },
  { key: "topTV", title: "Top Rated TV Shows", icon: "tv-outline", color: "#22c55e", description: "Highest rated series" },
  { key: "collections", title: "Movie Collections", icon: "albums-outline", color: "#d946ef", description: "Franchise & series" },
  { key: "anime", title: "Top Anime", icon: "flash-outline", color: "#8b5cf6", description: "Best anime of all time" },
  { key: "manga", title: "Manga Library", icon: "book-outline", color: "#ef4444", description: "Popular manga titles" },
  { key: "comics", title: "Comics", icon: "layers-outline", color: "#06b6d4", description: "Browse comic series" },
  { key: "novels", title: "Light Novels", icon: "library-outline", color: "#eab308", description: "Light novel collection" },
];
