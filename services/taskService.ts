import { Task, ITask } from "../schema/taskSchema";
import mongoose from "mongoose";

export interface TaskCreateData {
  title: string;
  description?: string;
  status?: "pending" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high";
  assignedTo?: number;
  assignedBy: number;
  assignedToName?: string;
  assignedByName: string;
  createdBy: number;
  dueDate?: Date;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  status?: "pending" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high";
  assignedTo?: number;
  assignedBy?: number;
  assignedToName?: string;
  assignedByName?: string;
  updatedBy: number;
  dueDate?: Date;
}

export interface TaskFilters {
  page: number;
  limit: number;
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
}

export interface PaginatedTasks {
  tasks: ITask[];
  totalTasks: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class TaskService {
  // Create a new task
  public async createTask(taskData: TaskCreateData): Promise<ITask> {
    try {
      // Validate assignedBy user ID
      if (!taskData.assignedBy || typeof taskData.assignedBy !== "number") {
        throw new Error("Valid assignedBy user ID is required");
      }

      // Validate createdBy user ID
      if (!taskData.createdBy || typeof taskData.createdBy !== "number") {
        throw new Error("Valid createdBy user ID is required");
      }

      // Validate assignedTo user ID if provided
      if (taskData.assignedTo && typeof taskData.assignedTo !== "number") {
        throw new Error("Invalid assignedTo user ID format");
      }

      // Validate required names
      if (!taskData.assignedByName || taskData.assignedByName.trim() === "") {
        throw new Error("AssignedByName is required");
      }

      // Set updatedBy fields to createdBy for new tasks
      const taskDataWithUpdate = {
        ...taskData,
        updatedBy: taskData.createdBy,
      };

      // Create new task
      const task = new Task(taskDataWithUpdate);
      const savedTask = await task.save();

      return savedTask;
    } catch (error) {
      throw error;
    }
  }

  // Get all tasks with filtering and pagination
  public async getAllTasks(filters: TaskFilters): Promise<PaginatedTasks> {
    try {
      const { page, limit, status, priority, assignedTo, search } = filters;
      const skip = (page - 1) * limit;

      // Build filter query
      let query: any = {};

      if (status) {
        query.status = status;
      }

      if (priority) {
        query.priority = priority;
      }

      if (assignedTo) {
        if (typeof assignedTo !== "string" || isNaN(Number(assignedTo))) {
          throw new Error("Invalid assignedTo user ID format");
        }
        query.assignedTo = Number(assignedTo);
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { assignedToName: { $regex: search, $options: "i" } },
          { assignedByName: { $regex: search, $options: "i" } },
          { createdByName: { $regex: search, $options: "i" } },
          { updatedByName: { $regex: search, $options: "i" } },
        ];
      }

      // Get tasks with pagination
      const tasks = await Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      // Get total count
      const totalTasks = await Task.countDocuments(query);
      const totalPages = Math.ceil(totalTasks / limit);

      return {
        tasks,
        totalTasks,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get task by ID
  public async getTaskById(taskId: string): Promise<ITask | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new Error("Invalid task ID format");
      }

      const task = await Task.findById(taskId).exec();
      return task;
    } catch (error) {
      throw error;
    }
  }

  // Update task
  public async updateTask(
    taskId: string,
    updateData: TaskUpdateData
  ): Promise<ITask | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new Error("Invalid task ID format");
      }

      // Validate updatedBy user ID
      if (!updateData.updatedBy || typeof updateData.updatedBy !== "number") {
        throw new Error("Valid updatedBy user ID is required");
      }

      // Validate assignedTo user ID if provided
      if (updateData.assignedTo && typeof updateData.assignedTo !== "number") {
        throw new Error("Invalid assignedTo user ID format");
      }

      // Validate assignedBy user ID if provided
      if (updateData.assignedBy && typeof updateData.assignedBy !== "number") {
        throw new Error("Invalid assignedBy user ID format");
      }

      const task = await Task.findByIdAndUpdate(taskId, updateData, {
        new: true,
        runValidators: true,
      }).exec();

      return task;
    } catch (error) {
      throw error;
    }
  }

  // Delete task
  public async deleteTask(taskId: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new Error("Invalid task ID format");
      }

      const result = await Task.findByIdAndDelete(taskId).exec();
      return result !== null;
    } catch (error) {
      throw error;
    }
  }

  // Get tasks by user (assigned by or assigned to)
  public async getTasksByUser(
    userId: number,
    type: "assignedBy" | "assignedTo" = "assignedTo",
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedTasks> {
    try {
      if (typeof userId !== "number") {
        throw new Error("Invalid user ID format");
      }

      const skip = (page - 1) * limit;

      // Build query based on type
      let query: any = {};
      if (type === "assignedBy") {
        query.assignedBy = userId;
      } else {
        query.assignedTo = userId;
      }

      // Get tasks with pagination
      const tasks = await Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      // Get total count
      const totalTasks = await Task.countDocuments(query);
      const totalPages = Math.ceil(totalTasks / limit);

      return {
        tasks,
        totalTasks,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      throw error;
    }
  }

  // Update task status
  public async updateTaskStatus(
    taskId: string,
    status: "pending" | "in-progress" | "completed",
    updatedBy: number,
    updatedByName: string
  ): Promise<ITask | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new Error("Invalid task ID format");
      }

      if (!["pending", "in-progress", "completed"].includes(status)) {
        throw new Error("Invalid status value");
      }

      if (!updatedBy || typeof updatedBy !== "number") {
        throw new Error("Valid updatedBy user ID is required");
      }

      if (!updatedByName || updatedByName.trim() === "") {
        throw new Error("UpdatedByName is required");
      }

      const task = await Task.findByIdAndUpdate(
        taskId,
        { status, updatedBy, updatedByName },
        { new: true, runValidators: true }
      ).exec();

      return task;
    } catch (error) {
      throw error;
    }
  }

  // Get task statistics
  public async getTaskStats(userId?: number): Promise<any> {
    try {
      let matchQuery: any = {};
      if (userId) {
        if (typeof userId !== "number") {
          throw new Error("Invalid user ID format");
        }
        matchQuery = {
          $or: [{ assignedBy: userId }, { assignedTo: userId }],
        };
      }

      const stats = await Task.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
            },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            high: {
              $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] },
            },
            medium: {
              $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] },
            },
            low: {
              $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] },
            },
          },
        },
      ]);

      return (
        stats[0] || {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          high: 0,
          medium: 0,
          low: 0,
        }
      );
    } catch (error) {
      throw error;
    }
  }
}
