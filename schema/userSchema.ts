import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user" | "manager";
  permissions: string[];
  createdBy?: number;
  updatedBy?: number;
  resetPasswordOTP?: string;
  resetPasswordOTPExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
    },
    permissions: {
      type: [String],
      default: ["Read"],
      validate: {
        validator: function (permissions: string[]) {
          const validPermissions = ["Read", "Write", "Admin"];
          return permissions.every((permission) =>
            validPermissions.includes(permission)
          );
        },
        message:
          "Invalid permission. Allowed permissions: Read, Write, Delete, Admin, Manage",
      },
    },
    createdBy: {
      type: Number,
      default: null,
    },
    updatedBy: {
      type: Number,
      default: null,
    },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordOTPExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any).password;
        return ret;
      },
    },
  }
);

// Indexes for better performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ createdBy: 1 });
UserSchema.index({ updatedBy: 1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>("User", UserSchema);
export default User;
