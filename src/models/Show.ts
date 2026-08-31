import mongoose, { Model, Schema } from 'mongoose';

export interface IShow {
  movie: string;
  showDateTime: Date;
  showPrice: number;
  occupiedSeats: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const showSchema = new Schema<IShow>(
  {
    movie: { type: String, required: true, ref: 'Movie' },
    showDateTime: { type: Date, required: true },
    showPrice: { type: Number, required: true },
    occupiedSeats: { type: Object, default: {} },
  },
  { minimize: false }
);

const Show: Model<IShow> = mongoose.models.Show || mongoose.model<IShow>('Show', showSchema);

export default Show;