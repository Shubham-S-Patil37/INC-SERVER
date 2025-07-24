import { User, IUser } from "../schema/userSchema";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "admin" | "user" | "manager";
  permissions?: string[];
  createdBy?: number;
}

export interface UserUpdateData {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: "admin" | "user" | "manager";
  permissions?: string[];
  updatedBy?: number;
}
export interface UserLoginResult {
  success: boolean;
  message: string;
  user?: IUser;
  accessToken?: string;
  refreshToken?: string;
}

export interface UserLoginData {
  username: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface UpdatePasswordData {
  email: string;
  newPassword: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface TokenResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface PaginatedUsers {
  users: IUser[];
  totalUsers: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class UserService {
  public async createUser(userData: UserCreateData): Promise<IUser> {
    try {
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      });
      if (existingUser) {
        if (existingUser.email === userData.email) {
          throw new Error("User with this email already exists");
        }
        if (existingUser.username === userData.username) {
          throw new Error("User with this username already exists");
        }
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const userDataWithAudit = {
        ...userData,
        password: hashedPassword,
        updatedBy: userData.createdBy, // Set updatedBy to createdBy for new users
      };

      const user = new User(userDataWithAudit);
      const savedUser = await user.save();
      return savedUser;
    } catch (error: any) {
      if (error.code === 11000) {
        if (error.keyPattern?.email) {
          throw new Error("Email already exists");
        }
        if (error.keyPattern?.username) {
          throw new Error("Username already exists");
        }
        throw new Error("User already exists");
      }
      throw error;
    }
  }

  public async loginUser(loginData: UserLoginData): Promise<UserLoginResult> {
    try {
      const user = await User.findOne({ username: loginData.username }).exec();
      if (!user) {
        return {
          success: false,
          message: "Invalid username or password",
        };
      }
      const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.password
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid username or password",
        };
      }
      const accessTokenPayload = {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        firstName: user.firstName,
        lastName: user.lastName,
        type: "access",
      };
      const accessToken = jwt.sign(
        accessTokenPayload,
        process.env.JWT_SECRET || "",
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "15m",
          algorithm: "HS256",
        } as jwt.SignOptions
      );
      const refreshTokenPayload = {
        userId: user._id,
        type: "refresh",
      };
      const refreshToken = jwt.sign(
        refreshTokenPayload,
        process.env.REFRESH_TOKEN_SECRET as string,
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
          algorithm: "HS256",
        } as jwt.SignOptions
      );
      return {
        success: true,
        message: "Login successful",
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  }

  public async forgotPassword(
    forgotData: ForgotPasswordData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findOne({ email: forgotData.email }).exec();
      if (!user) {
        return {
          success: false,
          message: "No user found with this email address",
        };
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 600000);
      user.resetPasswordOTP = otp;
      user.resetPasswordOTPExpires = otpExpiry;
      if (!user.username) user.username = user.email.split("@")[0];
      await user.save();
      await this.sendOTPEmail(
        user.email,
        otp,
        `${user.firstName} ${user.lastName}`
      );
      return {
        success: true,
        message: "Password reset OTP sent to your email",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to send password reset OTP",
      };
    }
  }

  public async verifyOTP(
    otpData: VerifyOTPData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findOne({
        email: otpData.email,
        resetPasswordOTP: otpData.otp,
        resetPasswordOTPExpires: { $gt: new Date() },
      }).exec();
      if (!user) {
        return {
          success: false,
          message: "Invalid or expired OTP",
        };
      }
      return {
        success: true,
        message: "OTP verified successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to verify OTP",
      };
    }
  }

  public async updatePassword(
    passwordData: UpdatePasswordData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findOne({ email: passwordData.email }).exec();
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(
        passwordData.newPassword,
        saltRounds
      );
      user.password = hashedPassword;
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      await user.save();
      return {
        success: true,
        message: "Password updated successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update password",
      };
    }
  }

  public async refreshAccessToken(
    refreshTokenData: RefreshTokenData
  ): Promise<TokenResponse> {
    try {
      const decoded = jwt.verify(
        refreshTokenData.refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as any;
      if (decoded.type !== "refresh") {
        return {
          success: false,
          message: "Invalid token type",
        };
      }
      const user = await User.findById(decoded.userId).exec();
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }
      const accessTokenPayload = {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        firstName: user.firstName,
        lastName: user.lastName,
        type: "access",
      };
      const newAccessToken = jwt.sign(
        accessTokenPayload,
        process.env.JWT_SECRET as string,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "15m",
          algorithm: "HS256",
        } as jwt.SignOptions
      );
      return {
        success: true,
        accessToken: newAccessToken,
        refreshToken: refreshTokenData.refreshToken,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to refresh token",
      };
    }
  }

  private async sendOTPEmail(
    email: string,
    otp: string,
    userName: string
  ): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Password Reset OTP - INC Task Management",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset OTP</h2>
            <p>Hello ${userName},</p>
            <p>You requested to reset your password for your INC Task Management account.</p>
            <p>Your One-Time Password (OTP) is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f8f9fa; border: 2px dashed #007bff; 
                          padding: 20px; border-radius: 10px; display: inline-block;">
                <h1 style="color: #007bff; margin: 0; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
              </div>
            </div>
            <p><strong>This OTP will expire in 10 minutes.</strong></p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              INC Task Management System<br>
              This is an automated email, please do not reply.
            </p>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      throw new Error("Failed to send OTP email");
    }
  }

  public decodeToken(token: string): any {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      return {
        success: true,
        data: decoded,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Invalid token",
      };
    }
  }

  public async getUserFromToken(
    token: string
  ): Promise<{ success: boolean; user?: IUser; message?: string }> {
    try {
      const decodedResult = this.decodeToken(token);
      if (!decodedResult.success) {
        return {
          success: false,
          message: decodedResult.message,
        };
      }
      const decoded = decodedResult.data as any;
      const user = await User.findById(decoded.userId).exec();
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }
      return {
        success: true,
        user: user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to get user from token",
      };
    }
  }

  public async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaginatedUsers> {
    try {
      const skip = (page - 1) * limit;
      let query: any = {};
      if (search) {
        query = {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        };
      }
      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      const totalUsers = await User.countDocuments(query);
      const totalPages = Math.ceil(totalUsers / limit);
      return {
        users,
        totalUsers,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      throw error;
    }
  }

  public async getUserById(userId: string): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }
      const user = await User.findById(userId).exec();
      return user;
    } catch (error) {
      throw error;
    }
  }

  public async updateUser(
    userId: string,
    updateData: UserUpdateData
  ): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }
      if (!updateData.updatedBy || typeof updateData.updatedBy !== "number") {
        throw new Error("Valid updatedBy user ID is required");
      }
      if (updateData.email) {
        const existingUser = await User.findOne({
          email: updateData.email,
          _id: { $ne: userId },
        });
        if (existingUser) {
          throw new Error("Email already exists");
        }
      }
      if (updateData.username) {
        const existingUser = await User.findOne({
          username: updateData.username,
          _id: { $ne: userId },
        });
        if (existingUser) {
          throw new Error("Username already exists");
        }
      }
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).exec();
      return user;
    } catch (error: any) {
      if (error.code === 11000) {
        if (error.keyPattern?.email) {
          throw new Error("Email already exists");
        }
        if (error.keyPattern?.username) {
          throw new Error("Username already exists");
        }
        throw new Error("Duplicate field error");
      }
      throw error;
    }
  }

  public async deleteUser(userId: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }
      const result = await User.findByIdAndDelete(userId).exec();
      return result !== null;
    } catch (error) {
      throw error;
    }
  }

  public async getUserByUsername(username: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ username }).exec();
      return user;
    } catch (error) {
      throw error;
    }
  }

  public async getUsersByRole(
    role: "admin" | "user" | "manager",
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedUsers> {
    try {
      const skip = (page - 1) * limit;
      const users = await User.find({ role })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      const totalUsers = await User.countDocuments({ role });
      const totalPages = Math.ceil(totalUsers / limit);
      return {
        users,
        totalUsers,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      throw error;
    }
  }

  public async uploadFile(buffer: Buffer, userId: string) {
    cloudinary.config({
      cloud_name: "dkuxov9di",
      api_key: "939636488482192",
      api_secret: "ihb_VXVHyu-Sg-VOSs_c1ZqjFo0",
    });
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "my_uploads" },
        async (error, result) => {
          if (error) {
            reject(error);
          } else {
            const imageUrl =
              result && result.secure_url ? result.secure_url : null;
            resolve(imageUrl);
          }
        }
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }

  async updateImageUrl(userId: string, imageUrl: string) {
    const data = await User.findByIdAndUpdate(userId, {
      imageUrl: imageUrl,
    }).exec();
    if (!data) {
      throw new Error("User not found");
    }
    if (!data.imageUrl) {
      throw new Error("Image URL not updated");
    }
    return data;
  }
}
