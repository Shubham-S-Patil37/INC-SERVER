import express from "express";
import { UserController } from "../controller/userController";
import { authenticateToken, optionalAuth } from "../middleware/auth";

const router = express.Router();
const userController = new UserController();

// User CRUD routes
router.post("/users", userController.createUser);
router.get("/users", authenticateToken, userController.getAllUsers);
router.get("/users/profile", authenticateToken, userController.getUserProfile);
router.put(
  "/users/profile",
  authenticateToken,
  userController.updateUserProfile
);
router.delete(
  "/users/profile",
  authenticateToken,
  userController.deleteUserProfile
);

// Additional user routes (admin only)
router.get(
  "/users/username/:username",
  authenticateToken,
  userController.getUserByUsername
);
router.get(
  "/users/role/:role",
  authenticateToken,
  userController.getUsersByRole
);

// Admin routes for managing other users
router.get("/admin/users", authenticateToken, userController.getUserById);
router.put("/admin/users/", authenticateToken, userController.updateUser);
router.delete("/admin/users/", authenticateToken, userController.deleteUser);

// Authentication routes (no auth required)
router.post("/auth/login", userController.loginUser);
router.post("/auth/refresh-token", userController.refreshToken);
router.post("/auth/forgot-password", userController.forgotPassword);
router.post("/auth/verify-otp", userController.verifyOTP);
router.post("/auth/update-password", userController.updatePassword);

// Protected route to verify token and get user info
router.get("/auth/verify-token", authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Token is valid",
    data: req.user,
  });
});

// User CRUD routes (keeping for backwards compatibility)
router.post("/users/login", userController.loginUser);

export default router;
