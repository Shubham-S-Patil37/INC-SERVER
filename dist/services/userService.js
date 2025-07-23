"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const userSchema_1 = require("../schema/userSchema");
const mongoose_1 = __importDefault(require("mongoose"));
class UserService {
    // Create a new user
    async createUser(userData) {
        try {
            // Check if user already exists
            const existingUser = await userSchema_1.User.findOne({ email: userData.email });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
            // Create new user
            const user = new userSchema_1.User(userData);
            const savedUser = await user.save();
            return savedUser;
        }
        catch (error) {
            if (error.code === 11000) {
                throw new Error('Email already exists');
            }
            throw error;
        }
    }
    // Get all users with pagination and search
    async getAllUsers(page = 1, limit = 10, search) {
        try {
            const skip = (page - 1) * limit;
            // Build search query
            let query = {};
            if (search) {
                query = {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                };
            }
            // Get users with pagination
            const users = await userSchema_1.User.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
            // Get total count
            const totalUsers = await userSchema_1.User.countDocuments(query);
            const totalPages = Math.ceil(totalUsers / limit);
            return {
                users,
                totalUsers,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Get user by ID
    async getUserById(userId) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID format');
            }
            const user = await userSchema_1.User.findById(userId).exec();
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    // Update user
    async updateUser(userId, updateData) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID format');
            }
            // Check if email is being updated and if it already exists
            if (updateData.email) {
                const existingUser = await userSchema_1.User.findOne({
                    email: updateData.email,
                    _id: { $ne: userId }
                });
                if (existingUser) {
                    throw new Error('Email already exists');
                }
            }
            const user = await userSchema_1.User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).exec();
            return user;
        }
        catch (error) {
            if (error.code === 11000) {
                throw new Error('Email already exists');
            }
            throw error;
        }
    }
    // Delete user
    async deleteUser(userId) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID format');
            }
            const result = await userSchema_1.User.findByIdAndDelete(userId).exec();
            return result !== null;
        }
        catch (error) {
            throw error;
        }
    }
    // Login user (simple implementation without JWT)
    async loginUser(email, password) {
        try {
            // Find user by email
            const user = await userSchema_1.User.findOne({ email }).select('+password').exec();
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }
            // Simple password comparison (in production, use bcrypt)
            if (user.password !== password) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }
            // Remove password from response
            const userResponse = user.toJSON();
            return {
                success: true,
                message: 'Login successful',
                user: userResponse
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Get user by email
    async getUserByEmail(email) {
        try {
            const user = await userSchema_1.User.findOne({ email }).exec();
            return user;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map