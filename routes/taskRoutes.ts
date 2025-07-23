import express from "express";
import { TaskController } from "../controller/taskController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const taskController = new TaskController();

// All task routes require authentication
router.use(authenticateToken);

// Task CRUD routes
router.post("/tasks", taskController.createTask);
router.get("/tasks", taskController.getAllTasks);
router.get("/tasks/:id", taskController.getTaskById);
router.put("/tasks/:id", taskController.updateTask);
router.delete("/tasks/:id", taskController.deleteTask);

// Task status update
router.patch("/tasks/:id/status", taskController.updateTaskStatus);

// User-specific task routes (gets tasks for current authenticated user)
router.get("/my-tasks", taskController.getMyTasks);

export default router;
