import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBooking extends Document {
  user: string;
  show: string;
  amount: number;
  bookedSeats: string[]; // ya jo bhi data type aap seats ke liye use kar rahe hain
  isPaid: boolean;
  paymentLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: { type: String, required: true, ref: "User" },
    show: { type: String, required: true, ref: "Show" },
    amount: { type: Number, required: true },
    bookedSeats: { type: [String], required: true },
    isPaid: { type: Boolean, default: false },
    paymentLink: { type: String },
  },
  { timestamps: true }
);

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);