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

  // Better Auth session check aur Admin validation
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new ApiError(401, "Unauthorized: Please log in");
  }

  // Agar user collection mein role field rakhi hai toh admin check yehi hoga:
  if (session.user.role !== "admin") {
    throw new ApiError(403, "Not authorized as admin");
  }

  const body = await req.json(); 
  const { movieId, showsInput, showPrice } = body;

  if (!movieId || !showsInput || !showPrice) {
    throw new ApiError(400, "movieId, showsInput, and showPrice are required");
  }

  // 1. Check if movie already exists in database
  let movie = await Movie.findById(movieId);

  // 2. If movie doesn't exist, fetch details & credits from TMDB API and save it
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
      _id: movieId,
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

 // 3. Create shows array using video's logic
  const showsToCreate: any[] = [];
  
  showsInput.forEach((show: any) => {
    const showDate = show.date;
    show.time.forEach((time: string) => {
      const dateTimeString = `${showDate}T${time}`;
      showsToCreate.push({
        movie: movieId,
        showDateTime: new Date(dateTimeString),
        showPrice,
        occupiedSeats: {},
      });
    });
  });

  let createdShows:any[] = [];
  if (showsToCreate.length > 0) {
    createdShows = await Show.insertMany(showsToCreate);
  }

  // 4. Return final success response
  return NextResponse.json(
    new ApiResponse(201, "Shows added successfully", { createdShows, movie }),
    { status: 201 }
  );
}); 


// API to get all shows from the database
export const getShows = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  // 1. Future ya current shows fetch karein aur movie details populate karein
  const shows = await Show.find({ showDateTime: { $gte: new Date() } })
    .populate("movie")
    .sort({ showDateTime: 1 });

  // 2. Filter unique shows (movie-wise unique list)
  const uniqueShows = Array.from(
    new Set(shows.map((show: any) => show.movie))
  );

  // 3. Return success response
  return NextResponse.json(
    new ApiResponse(200, "Shows fetched successfully", { shows: uniqueShows }),
    { status: 200 }
  );
});

// API to get a single show/movie details and its upcoming showtimes from the database
export const getShow = asyncHandler(async (req: NextRequest, context?: { params: Promise<{ movieId: string }> }) => {
      await connectDB();
      if (!context?.params) {
    throw new ApiError(400, "Route parameters are missing");
  } 

  const { movieId } = await context?.params;

  if (!movieId) {
    throw new ApiError(400, "Movie ID is required");
  }

  // 1. Get all upcoming shows for the movie
  const shows = await Show.find({ 
    movie: movieId, 
    showDateTime: { $gte: new Date() } 
  });

  // 2. Find movie details
  const movie = await Movie.findById(movieId);

  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  // 3. Group shows by date (video's logic)
  const dateTime: Record<string, any[]> = {};

  shows.forEach((show: any) => {
    const date = show.showDateTime.toISOString().split("T")[0];
    if (!dateTime[date]) {
      dateTime[date] = [];
    }
    dateTime[date].push({
      time: show.showDateTime,
      showId: show._id,
    });
  });

  // 4. Return success response
  return NextResponse.json(
    new ApiResponse(200, "Show details fetched successfully", { movie, dateTime }),
    { status: 200 }
  );
});