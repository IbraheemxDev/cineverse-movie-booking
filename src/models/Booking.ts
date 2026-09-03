import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId | string;
  show: mongoose.Types.ObjectId | string;
  amount: number;
  bookedSeats: string[];
  isPaid: boolean;
  paymentLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      ref: "User" 
    },
    show: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      ref: "Show" 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    bookedSeats: { 
      type: [String], 
      required: true 
    },
    isPaid: { 
      type: Boolean, 
      default: false 
    },
    paymentLink: { 
      type: String 
    },
  },
  { 
    timestamps: true 
  }
);

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);