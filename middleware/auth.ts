import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

// Extend Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        email: string;
        role: string;
        permissions: string[];
        firstName: string;
        lastName: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Check if it's an access token
    if (decoded.type !== "access") {
      res.status(401).json({
        success: false,
        message: "Invalid token type. Access token required.",
      });
      return;
    }

    // Add user information to request object
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || "Invalid or expired token",
    });
  }
};

// Optional middleware for routes that can work with or without authentication
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;

      if (decoded.type === "access") {
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
        };
      }
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user info
    next();
  }
};
