import mongoose, { Model, Schema } from 'mongoose';

export interface IUser {
  _id: any;
  name: string;
  email: string;
  image?: string;
  role?: string;
  emailVerified?: boolean;
  favorites?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    role: { type: String, default: 'user' },
    emailVerified: { type: Boolean, default: false },
    favorites: { type: [String], default: [] },
  },
  {
    timestamps: true,
    collection: 'user', // Better Auth ki collection
  }
);

// Delete existing compiled model in dev mode to apply new schema
if (mongoose.models.User) {
  delete (mongoose.models as any).User;
}

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema, 'user');

export default User;