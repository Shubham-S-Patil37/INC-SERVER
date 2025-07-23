import { Request, Response } from "express";
import { TaskService } from "../services/taskService";

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  // Create a new task
  public createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Add createdBy from authenticated user
      const taskData = {
        ...req.body,
        createdBy: parseInt(userId),
        assignedBy: parseInt(userId), // Default to current user if not specified
        assignedByName: `${req.user?.firstName} ${req.user?.lastName}`,
      };

      const task = await this.taskService.createTask(taskData);
      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Error creating task",
        error: error,
      });
    }
  };

  // Get all tasks
  public getAllTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const assignedTo = req.query.assignedTo as string;
      const search = req.query.search as string;

      const result = await this.taskService.getAllTasks({
        page,
        limit,
        status,
        priority,
        assignedTo,
        search,
      });

      res.status(200).json({
        success: true,
        message: "Tasks retrieved successfully",
        data: result.tasks,
        pagination: {
          currentPage: page,
          totalPages: result.totalPages,
          totalTasks: result.totalTasks,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error retrieving tasks",
        error: error,
      });
    }
  };

  // Get task by ID
  public getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.id;
      const task = await this.taskService.getTaskById(taskId);

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Task not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Task retrieved successfully",
        data: task,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error retrieving task",
        error: error,
      });
    }
  };

  // Update task
  public updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const taskId = req.params.id;
      const updateData = {
        ...req.body,
        updatedBy: parseInt(userId),
      };

      const task = await this.taskService.updateTask(taskId, updateData);

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Task not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Error updating task",
        error: error,
      });
    }
  };

  // Delete task
  public deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskId = req.params.id;
      const result = await this.taskService.deleteTask(taskId);

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Task not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error deleting task",
        error: error,
      });
    }
  };

  // Get tasks by user
  public getTasksByUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const type =
        (req.query.type as "assignedBy" | "assignedTo") || "assignedTo";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
        return;
      }

      const result = await this.taskService.getTasksByUser(
        userId,
        type,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        message: `Tasks ${type} by user retrieved successfully`,
        data: result.tasks,
        pagination: {
          currentPage: page,
          totalPages: result.totalPages,
          totalTasks: result.totalTasks,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error retrieving user tasks",
        error: error,
      });
    }
  };

  // Get tasks for current authenticated user
  public getMyTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const type = (req.query.type as string) || "assigned"; // assigned, created, or both

      const result = await this.taskService.getTasksByUser(
        parseInt(userId),
        type as "assignedBy" | "assignedTo",
        page,
        limit
      );

      res.status(200).json({
        success: true,
        message: `My tasks retrieved successfully`,
        data: result.tasks,
        pagination: {
          currentPage: page,
          totalPages: result.totalPages,
          totalTasks: result.totalTasks,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error retrieving my tasks",
        error: error,
      });
    }
  };

  // Update task status
  public updateTaskStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const taskId = req.params.id;
      const { status, updatedBy, updatedByName } = req.body;

      // Validate required fields
      if (!updatedBy || !updatedByName) {
        res.status(400).json({
          success: false,
          message: "updatedBy and updatedByName are required",
        });
        return;
      }

      const task = await this.taskService.updateTaskStatus(
        taskId,
        status,
        updatedBy,
        updatedByName
      );

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Task not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Task status updated successfully",
        data: task,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Error updating task status",
        error: error,
      });
    }
  };
}
