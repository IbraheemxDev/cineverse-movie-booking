import mongoose, { Model, Schema } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  favorites: mongoose.Types.ObjectId[]; // Added favorites field
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { 
      type: String, 
      required: true 
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: false,
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Movie',
      }
    ],
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;