"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
class UserController {
    constructor() {
        // Create a new user
        this.createUser = async (req, res) => {
            try {
                const userData = req.body;
                const user = await this.userService.createUser(userData);
                res.status(201).json({
                    success: true,
                    message: 'User created successfully',
                    data: user
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Error creating user',
                    error: error
                });
            }
        };
        // Get all users
        this.getAllUsers = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const search = req.query.search;
                const result = await this.userService.getAllUsers(page, limit, search);
                res.status(200).json({
                    success: true,
                    message: 'Users retrieved successfully',
                    data: result.users,
                    pagination: {
                        currentPage: page,
                        totalPages: result.totalPages,
                        totalUsers: result.totalUsers,
                        hasNext: result.hasNext,
                        hasPrev: result.hasPrev
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Error retrieving users',
                    error: error
                });
            }
        };
        // Get user by ID
        this.getUserById = async (req, res) => {
            try {
                const userId = req.params.id;
                const user = await this.userService.getUserById(userId);
                if (!user) {
                    res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'User retrieved successfully',
                    data: user
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Error retrieving user',
                    error: error
                });
            }
        };
        // Update user
        this.updateUser = async (req, res) => {
            try {
                const userId = req.params.id;
                const updateData = req.body;
                const user = await this.userService.updateUser(userId, updateData);
                if (!user) {
                    res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'User updated successfully',
                    data: user
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Error updating user',
                    error: error
                });
            }
        };
        // Delete user
        this.deleteUser = async (req, res) => {
            try {
                const userId = req.params.id;
                const result = await this.userService.deleteUser(userId);
                if (!result) {
                    res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'User deleted successfully'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Error deleting user',
                    error: error
                });
            }
        };
        // Login user
        this.loginUser = async (req, res) => {
            try {
                const { email, password } = req.body;
                const result = await this.userService.loginUser(email, password);
                if (!result.success) {
                    res.status(401).json({
                        success: false,
                        message: result.message
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    data: result.user
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Error during login',
                    error: error
                });
            }
        };
        this.userService = new userService_1.UserService();
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map