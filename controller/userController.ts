import { Request, Response } from "express";
import { UserService } from "../services/userService";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Create a new user
  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData = req.body;
      if (!userData.userName || !userData.password) {
        res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
        return;
      }

      if (!userData.email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      if (
        !userData.role ||
        !["admin", "user", "manager"].includes(userData.role)
      ) {
        res.status(400).json({
          success: false,
          message: "Role is required and must be one of: admin, user, manager",
        });
        return;
      }

      const names = userData.name.split(" ");
      userData.firstName = names[0];
      userData.lastName = names[1] || "";

      // Add createdBy from authenticated user
      const userId = req.user?.userId || "1";

      userData.createdBy = parseInt(userId);
      userData.updatedBy = parseInt(userId);
      userData.role = userData.role.toLowerCase(); // Ensure role is lowercase
      if (userData.role !== "admin" && userData.role !== "user") {
        res.status(400).json({
          success: false,
          message: "Role must be one of: admin, user",
        });
        return;
      }

      const user = await this.userService.createUser(userData);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Error creating user",
        error: JSON.stringify(error),
      });
    }
  };

  // User login
  public loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
        return;
      }

      const result = await this.userService.loginUser({ username, password });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Login failed",
        error: error,
      });
    }
  };

  // Forgot password
  public forgotPassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      const result = await this.userService.forgotPassword({ email });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to process forgot password request",
        error: error,
      });
    }
  };

  // Verify OTP
  public verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        res.status(400).json({
          success: false,
          message: "Email and OTP are required",
        });
        return;
      }

      const result = await this.userService.verifyOTP({ email, otp });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to verify OTP",
        error: error,
      });
    }
  };

  // Update password
  public updatePassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        res.status(400).json({
          success: false,
          message: "Email and new password are required",
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
        return;
      }

      const result = await this.userService.updatePassword({
        email,
        newPassword,
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update password",
        error: error,
      });
    }
  };

  // Get user info from token
  public getUserFromToken = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "Authorization token required",
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const result = await this.userService.getUserFromToken(token);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: "User information retrieved successfully",
          data: result.user,
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get user information",
        error: error,
      });
    }
  };

  // Refresh access token
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      const result = await this.userService.refreshAccessToken({
        refreshToken,
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: "Token refreshed successfully",
          data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to refresh token",
        error: error,
      });
    }
  };

  // Get current user's profile from token
  public getUserProfile = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User profile retrieved successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error retrieving user profile",
        error: error,
      });
    }
  };

  // Update current user's profile from token
  public updateUserProfile = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Add updatedBy from token
      const updateData = {
        ...req.body,
        updatedBy: parseInt(userId), // Convert string to number for consistency
      };

      const user = await this.userService.updateUser(userId, updateData);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Error updating user profile",
        error: error,
      });
    }
  };

  // Delete current user's profile from token
  public deleteUserProfile = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const deleted = await this.userService.deleteUser(userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User profile deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error deleting user profile",
        error: error,
      });
    }
  };

  // Get all users
  public getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await this.userService.getAllUsers(page, limit, search);
      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: result.users,
        pagination: {
          currentPage: page,
          totalPages: result.totalPages,
          totalUsers: result.totalUsers,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error retrieving users",
        error: error,
      });
    }
  };

  // Get user by ID
  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error retrieving user",
        error: error,
      });
    }
  };

  // Update user
  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;
      const updateData = req.body;

      const user = await this.userService.updateUser(userId, updateData);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Error updating user",
        error: error,
      });
    }
  };

  // Delete user
  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;
      const result = await this.userService.deleteUser(userId);

      if (!result) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error deleting user",
        error: error,
      });
    }
  };

  // Get user by username
  public getUserByUsername = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const username = req.params.username;
      const user = await this.userService.getUserByUsername(username);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error retrieving user",
        error: error,
      });
    }
  };

  // Get users by role
  public getUsersByRole = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const role = req.params.role as "admin" | "user" | "manager";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!["admin", "user", "manager"].includes(role)) {
        res.status(400).json({
          success: false,
          message: "Invalid role. Allowed roles: admin, user, manager",
        });
        return;
      }

      const result = await this.userService.getUsersByRole(role, page, limit);
      res.status(200).json({
        success: true,
        message: `Users with role ${role} retrieved successfully`,
        data: result.users,
        pagination: {
          currentPage: page,
          totalPages: result.totalPages,
          totalUsers: result.totalUsers,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error retrieving users by role",
        error: error,
      });
    }
  };
}
