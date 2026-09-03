import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { asyncHandler } from "@/utils/AsyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { ApiError } from "@/utils/ApiError";
import connectDB from "@/lib/dbConnect";
import Movie from "@/models/Movie";
import Show from "@/models/Show";

// function to get now playing movies
export const getNowPlayingMovies = asyncHandler(async (req: NextRequest) => {
  const { data } = await axios.get("https://api.themoviedb.org/3/movie/now_playing", {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
  });

  const movies = data.results;

  return NextResponse.json(
    new ApiResponse(200, "Now playing movies fetched successfully", { movies }),
    { status: 200 }
  );
});

// to add a new show to database  
export const addShow = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new ApiError(401, "Unauthorized: Please log in");
  }

  if (session.user.role !== "admin") {
    throw new ApiError(403, "Not authorized as admin");
  }

  const body = await req.json(); 
  const { movieId, showsInput, showPrice } = body;

  if (!movieId || !showsInput || !showPrice) {
    throw new ApiError(400, "movieId, showsInput, and showPrice are required");
  }

  let movie = await Movie.findById(movieId);

  if (!movie) {
    const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      }),
    ]);

    const movieApiData = movieDetailsResponse.data;
    const movieCreditsData = movieCreditsResponse.data;

    const movieDetails = {
      _id: String(movieId),
      title: movieApiData.title,
      overview: movieApiData.overview,
      poster_path: movieApiData.poster_path,
      backdrop_path: movieApiData.backdrop_path,
      release_date: movieApiData.release_date,
      original_language: movieApiData.original_language,
      tagline: movieApiData.tagline || "",
      genres: movieApiData.genres,
      casts: movieCreditsData.cast,
      vote_average: movieApiData.vote_average,
      runtime: movieApiData.runtime,
    };

    movie = await Movie.create(movieDetails);
  }

  const showsToCreate: any[] = [];
  
  showsInput.forEach((show: any) => {
    const showDate = show.date;
    show.time.forEach((time: string) => {
      const dateTimeString = `${showDate}T${time}`;
      showsToCreate.push({
        movie: String(movieId),
        showDateTime: new Date(dateTimeString),
        showPrice: Number(showPrice),
        occupiedSeats: {},
      });
    });
  });

  let createdShows: any[] = [];
  if (showsToCreate.length > 0) {
    createdShows = await Show.insertMany(showsToCreate);
  }

  return NextResponse.json(
    new ApiResponse(201, "Shows added successfully", { createdShows, movie }),
    { status: 201 }
  );
}); 

// API to get all unique movies that have upcoming shows
export const getShows = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  const shows = await Show.find({ showDateTime: { $gte: new Date() } })
    .populate("movie")
    .sort({ showDateTime: 1 })
    .lean();

  // FIX: Map use karke ID ki bunyad par unique filter karein taake duplicates na hon
  const movieMap = new Map();
  shows.forEach((show: any) => {
    if (show.movie && !movieMap.has(String(show.movie._id))) {
      movieMap.set(String(show.movie._id), show.movie);
    }
  });

  const uniqueShows = Array.from(movieMap.values());

  return NextResponse.json(
    new ApiResponse(200, "Shows fetched successfully", { shows: uniqueShows }),
    { status: 200 }
  );
});

// API to get a single movie's details & show schedule
export const getShow = asyncHandler(
  async (req: NextRequest, context?: { params: Promise<{ id?: string; movieId?: string }> }) => {
    await connectDB();

    if (!context?.params) {
      throw new ApiError(400, "Route parameters are missing");
    }

    const resolvedParams = await context.params;
    // URL param `id` ya `movieId` dono ko support karega
    const targetMovieId = resolvedParams.id || resolvedParams.movieId;

    if (!targetMovieId) {
      throw new ApiError(400, "Movie ID is required");
    }

    const [shows, movie] = await Promise.all([
      Show.find({
        movie: targetMovieId,
        showDateTime: { $gte: new Date() },
      }).sort({ showDateTime: 1 }).lean(),
      Movie.findById(targetMovieId).lean(),
    ]);

    if (!movie) {
      throw new ApiError(404, "Movie not found");
    }

    // Group shows by date
    const dateTime: Record<string, any[]> = {};

    shows.forEach((show: any) => {
      const date = new Date(show.showDateTime).toISOString().split("T")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({
        time: show.showDateTime,
        showId: String(show._id),
      });
    });

    return NextResponse.json(
      new ApiResponse(200, "Show details fetched successfully", { movie, dateTime }),
      { status: 200 }
    );
  }
);

// src/controllers/showController.ts

export const getTrailers = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  // 1. Future active shows fetch karein
  const shows = await Show.find({ showDateTime: { $gte: new Date() } })
    .populate("movie")
    .limit(10)
    .lean();

  // 2. Unique movies filter karein
  const movieMap = new Map();
  shows.forEach((show: any) => {
    if (show.movie && !movieMap.has(String(show.movie._id))) {
      movieMap.set(String(show.movie._id), show.movie);
    }
  });

  const uniqueMovies = Array.from(movieMap.values()).slice(0, 4);

  // 3. TMDB se original long-form official trailers fetch karein
  const trailerPromises = uniqueMovies.map(async (movie: any) => {
    try {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/movie/${movie._id}/videos`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }
      );

     // src/controllers/showController.ts ke andar:

const videos: any[] = data.results || [];

// 1. YouTube videos filter karein (Shorts aur Age-Restricted / Red-Band videos ko pehle hi reject karein)
const ytVideos = videos.filter((v: any) => {
  if (v.site !== "YouTube" || !v.key) return false;
  const name = v.name?.toLowerCase() || "";
  const isRestricted =
    name.includes("red band") ||
    name.includes("age restricted") ||
    name.includes("18+") ||
    name.includes("uncensored") ||
    name.includes("short");
  return !isRestricted;
});

// 2. Priority 1: Official Main / Clean Full Trailer
let bestTrailer = ytVideos.find(
  (v: any) =>
    v.type === "Trailer" &&
    v.official === true &&
    (v.name?.toLowerCase().includes("official trailer") ||
      v.name?.toLowerCase().includes("main trailer") ||
      v.name?.toLowerCase().includes("trailer"))
);

// 3. Priority 2: Any Official Trailer
if (!bestTrailer) {
  bestTrailer = ytVideos.find(
    (v: any) => v.type === "Trailer" && v.official === true
  );
}

// 4. Priority 3: Any Teaser
if (!bestTrailer) {
  bestTrailer = ytVideos.find((v: any) => v.type === "Teaser");
}

const finalTrailer = bestTrailer || ytVideos[0] || videos[0];

      if (!finalTrailer?.key) return null;

      return {
        id: String(movie._id),
        title: movie.title,
        videoUrl: `https://www.youtube.com/watch?v=${finalTrailer.key}`,
        image: movie.backdrop_path?.startsWith("http")
          ? movie.backdrop_path
          : `https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}`,
      };
    } catch {
      return null;
    }
  });

  const trailers = (await Promise.all(trailerPromises)).filter(Boolean);

  return NextResponse.json(
    new ApiResponse(200, "Trailers fetched successfully", { trailers }),
    { status: 200 }
  );
});