import mongoose, { Model, Schema } from 'mongoose';

export interface IMovie {
  _id: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  original_language?: string;
  tagline?: string;
  genres: any[];
  casts: any[];
  vote_average: number;
  runtime: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const movieSchema = new Schema<IMovie>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    overview: { type: String, required: true },
    poster_path: { type: String, required: true },
    backdrop_path: { type: String, required: true },
    release_date: { type: String, required: true },
    original_language: { type: String },
    tagline: { type: String },
    genres: { type: [Schema.Types.Mixed] as any, default: [] },
    casts: { type: [Schema.Types.Mixed] as any, default: [] },
    vote_average: { type: Number, required: true },
    runtime: { type: Number, required: true },
  },
  { timestamps: true }
);

const Movie: Model<IMovie> =
  mongoose.models.Movie || mongoose.model<IMovie>('Movie', movieSchema);

export default Movie;