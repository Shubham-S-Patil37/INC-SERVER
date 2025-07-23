"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const taskSchema_1 = require("../schema/taskSchema");
const mongoose_1 = __importDefault(require("mongoose"));
class TaskService {
    // Create a new task
    async createTask(taskData) {
        try {
            // Validate createdBy user ID
            if (!mongoose_1.default.Types.ObjectId.isValid(taskData.createdBy)) {
                throw new Error('Invalid createdBy user ID format');
            }
            // Validate assignedTo user ID if provided
            if (taskData.assignedTo && !mongoose_1.default.Types.ObjectId.isValid(taskData.assignedTo)) {
                throw new Error('Invalid assignedTo user ID format');
            }
            // Create new task
            const task = new taskSchema_1.Task(taskData);
            const savedTask = await task.save();
            // Populate user references
            await savedTask.populate(['createdBy', 'assignedTo']);
            return savedTask;
        }
        catch (error) {
            throw error;
        }
    }
    // Get all tasks with filtering and pagination
    async getAllTasks(filters) {
        try {
            const { page, limit, status, priority, assignedTo, search } = filters;
            const skip = (page - 1) * limit;
            // Build filter query
            let query = {};
            if (status) {
                query.status = status;
            }
            if (priority) {
                query.priority = priority;
            }
            if (assignedTo) {
                if (!mongoose_1.default.Types.ObjectId.isValid(assignedTo)) {
                    throw new Error('Invalid assignedTo user ID format');
                }
                query.assignedTo = assignedTo;
            }
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            // Get tasks with pagination
            const tasks = await taskSchema_1.Task.find(query)
                .populate('createdBy', 'name email')
                .populate('assignedTo', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
            // Get total count
            const totalTasks = await taskSchema_1.Task.countDocuments(query);
            const totalPages = Math.ceil(totalTasks / limit);
            return {
                tasks,
                totalTasks,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Get task by ID
    async getTaskById(taskId) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(taskId)) {
                throw new Error('Invalid task ID format');
            }
            const task = await taskSchema_1.Task.findById(taskId)
                .populate('createdBy', 'name email')
                .populate('assignedTo', 'name email')
                .exec();
            return task;
        }
        catch (error) {
            throw error;
        }
    }
    // Update task
    async updateTask(taskId, updateData) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(taskId)) {
                throw new Error('Invalid task ID format');
            }
            // Validate assignedTo user ID if provided
            if (updateData.assignedTo && !mongoose_1.default.Types.ObjectId.isValid(updateData.assignedTo)) {
                throw new Error('Invalid assignedTo user ID format');
            }
            const task = await taskSchema_1.Task.findByIdAndUpdate(taskId, updateData, { new: true, runValidators: true })
                .populate('createdBy', 'name email')
                .populate('assignedTo', 'name email')
                .exec();
            return task;
        }
        catch (error) {
            throw error;
        }
    }
    // Delete task
    async deleteTask(taskId) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(taskId)) {
                throw new Error('Invalid task ID format');
            }
            const result = await taskSchema_1.Task.findByIdAndDelete(taskId).exec();
            return result !== null;
        }
        catch (error) {
            throw error;
        }
    }
    // Get tasks by user (created or assigned)
    async getTasksByUser(userId, type = 'assigned', page = 1, limit = 10) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID format');
            }
            const skip = (page - 1) * limit;
            // Build query based on type
            let query = {};
            if (type === 'created') {
                query.createdBy = userId;
            }
            else {
                query.assignedTo = userId;
            }
            // Get tasks with pagination
            const tasks = await taskSchema_1.Task.find(query)
                .populate('createdBy', 'name email')
                .populate('assignedTo', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
            // Get total count
            const totalTasks = await taskSchema_1.Task.countDocuments(query);
            const totalPages = Math.ceil(totalTasks / limit);
            return {
                tasks,
                totalTasks,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Update task status
    async updateTaskStatus(taskId, status) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(taskId)) {
                throw new Error('Invalid task ID format');
            }
            if (!['pending', 'in-progress', 'completed'].includes(status)) {
                throw new Error('Invalid status value');
            }
            const task = await taskSchema_1.Task.findByIdAndUpdate(taskId, { status }, { new: true, runValidators: true })
                .populate('createdBy', 'name email')
                .populate('assignedTo', 'name email')
                .exec();
            return task;
        }
        catch (error) {
            throw error;
        }
    }
    // Get task statistics
    async getTaskStats(userId) {
        try {
            let matchQuery = {};
            if (userId) {
                if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                    throw new Error('Invalid user ID format');
                }
                matchQuery = {
                    $or: [
                        { createdBy: new mongoose_1.default.Types.ObjectId(userId) },
                        { assignedTo: new mongoose_1.default.Types.ObjectId(userId) }
                    ]
                };
            }
            const stats = await taskSchema_1.Task.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        pending: {
                            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                        },
                        inProgress: {
                            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                        },
                        completed: {
                            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                        },
                        high: {
                            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
                        },
                        medium: {
                            $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
                        },
                        low: {
                            $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
                        }
                    }
                }
            ]);
            return stats[0] || {
                total: 0,
                pending: 0,
                inProgress: 0,
                completed: 0,
                high: 0,
                medium: 0,
                low: 0
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=taskService.js.map