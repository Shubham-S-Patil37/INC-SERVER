"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controller/taskController");
const router = express_1.default.Router();
const taskController = new taskController_1.TaskController();
// Task CRUD routes
router.post('/tasks', taskController.createTask);
router.get('/tasks', taskController.getAllTasks);
router.get('/tasks/:id', taskController.getTaskById);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
// Task status update
router.patch('/tasks/:id/status', taskController.updateTaskStatus);
// User-specific task routes
router.get('/users/:userId/tasks', taskController.getTasksByUser);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map