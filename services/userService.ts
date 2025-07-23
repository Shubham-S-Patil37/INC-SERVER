import { User, IUser } from "../schema/userSchema";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

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
  // Create a new user
  public async createUser(userData: UserCreateData): Promise<IUser> {
    try {
      // Check if user already exists by email or username
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

      // Hash the password before saving
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create new user with audit fields
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

  // User login
  public async loginUser(loginData: UserLoginData): Promise<UserLoginResult> {
    try {
      // Find user by username
      const user = await User.findOne({ username: loginData.username }).exec();

      if (!user) {
        return {
          success: false,
          message: "Invalid username or password",
        };
      }

      // Check password
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

      // Generate access token with user info (short-lived)
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

      // Generate refresh token (long-lived, minimal payload)
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

  // Generate OTP and send email for password reset
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

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 600000); // 10 minutes from now

      // Save OTP to user
      user.resetPasswordOTP = otp;
      user.resetPasswordOTPExpires = otpExpiry;
      await user.save();

      // Send OTP email
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

  // Verify OTP for password reset
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

  // Update password after OTP verification
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

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(
        passwordData.newPassword,
        saltRounds
      );

      // Update user password and clear OTP
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

  // Refresh access token using refresh token
  public async refreshAccessToken(
    refreshTokenData: RefreshTokenData
  ): Promise<TokenResponse> {
    try {
      // Verify refresh token
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

      // Find user
      const user = await User.findById(decoded.userId).exec();
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Generate new access token
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
        refreshToken: refreshTokenData.refreshToken, // Keep the same refresh token
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to refresh token",
      };
    }
  }

  // Send OTP email for password reset
  private async sendOTPEmail(
    email: string,
    otp: string,
    userName: string
  ): Promise<void> {
    try {
      // Create transporter
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Email content
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

  // Decode JWT token and get user information
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

  // Get user information from token
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

  // Get all users with pagination and search
  public async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaginatedUsers> {
    try {
      const skip = (page - 1) * limit;

      // Build search query
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

      // Get users with pagination
      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      // Get total count
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

  // Get user by ID
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

  // Update user
  public async updateUser(
    userId: string,
    updateData: UserUpdateData
  ): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }

      // Validate updatedBy is provided
      if (!updateData.updatedBy || typeof updateData.updatedBy !== "number") {
        throw new Error("Valid updatedBy user ID is required");
      }

      // Check if email or username is being updated and if they already exist
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

  // Delete user
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

  // Get user by username
  public async getUserByUsername(username: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ username }).exec();
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Get users by role
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
}
