"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const taskService_1 = require("../services/taskService");
class TaskController {
    constructor() {
        // Create a new task
        this.createTask = async (req, res) => {
            try {
                const taskData = req.body;
                const task = await this.taskService.createTask(taskData);
                res.status(201).json({
                    success: true,
                    message: 'Task created successfully',
                    data: task
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Error creating task',
                    error: error
                });
            }
        };
        // Get all tasks
        this.getAllTasks = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const status = req.query.status;
                const priority = req.query.priority;
                const assignedTo = req.query.assignedTo;
                const search = req.query.search;
                const result = await this.taskService.getAllTasks({
                    page,
                    limit,
                    status,
                    priority,
                    assignedTo,
                    search
                });
                res.status(200).json({
                    success: true,
                    message: 'Tasks retrieved successfully',
                    data: result.tasks,
                    pagination: {
                        currentPage: page,
                        totalPages: result.totalPages,
                        totalTasks: result.totalTasks,
                        hasNext: result.hasNext,
                        hasPrev: result.hasPrev
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Error retrieving tasks',
                    error: error
                });
            }
        };
        // Get task by ID
        this.getTaskById = async (req, res) => {
            try {
                const taskId = req.params.id;
                const task = await this.taskService.getTaskById(taskId);
                if (!task) {
                    res.status(404).json({
                        success: false,
                        message: 'Task not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Task retrieved successfully',
                    data: task
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Error retrieving task',
                    error: error
                });
            }
        };
        // Update task
        this.updateTask = async (req, res) => {
            try {
                const taskId = req.params.id;
                const updateData = req.body;
                const task = await this.taskService.updateTask(taskId, updateData);
                if (!task) {
                    res.status(404).json({
                        success: false,
                        message: 'Task not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Task updated successfully',
                    data: task
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Error updating task',
                    error: error
                });
            }
        };
        // Delete task
        this.deleteTask = async (req, res) => {
            try {
                const taskId = req.params.id;
                const result = await this.taskService.deleteTask(taskId);
                if (!result) {
                    res.status(404).json({
                        success: false,
                        message: 'Task not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Task deleted successfully'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Error deleting task',
                    error: error
                });
            }
        };
        // Get tasks by user
        this.getTasksByUser = async (req, res) => {
            try {
                const userId = req.params.userId;
                const type = req.query.type || 'assigned';
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const result = await this.taskService.getTasksByUser(userId, type, page, limit);
                res.status(200).json({
                    success: true,
                    message: `Tasks ${type} by user retrieved successfully`,
                    data: result.tasks,
                    pagination: {
                        currentPage: page,
                        totalPages: result.totalPages,
                        totalTasks: result.totalTasks,
                        hasNext: result.hasNext,
                        hasPrev: result.hasPrev
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Error retrieving user tasks',
                    error: error
                });
            }
        };
        // Update task status
        this.updateTaskStatus = async (req, res) => {
            try {
                const taskId = req.params.id;
                const { status } = req.body;
                const task = await this.taskService.updateTaskStatus(taskId, status);
                if (!task) {
                    res.status(404).json({
                        success: false,
                        message: 'Task not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Task status updated successfully',
                    data: task
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Error updating task status',
                    error: error
                });
            }
        };
        this.taskService = new taskService_1.TaskService();
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=taskController.js.map