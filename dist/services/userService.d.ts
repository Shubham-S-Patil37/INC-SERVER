import { IUser } from '../schema/userSchema';
export interface UserCreateData {
    name: string;
    email: string;
    password: string;
}
export interface UserUpdateData {
    name?: string;
    email?: string;
    password?: string;
}
export interface UserLoginResult {
    success: boolean;
    message: string;
    user?: IUser;
}
export interface PaginatedUsers {
    users: IUser[];
    totalUsers: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class UserService {
    createUser(userData: UserCreateData): Promise<IUser>;
    getAllUsers(page?: number, limit?: number, search?: string): Promise<PaginatedUsers>;
    getUserById(userId: string): Promise<IUser | null>;
    updateUser(userId: string, updateData: UserUpdateData): Promise<IUser | null>;
    deleteUser(userId: string): Promise<boolean>;
    loginUser(email: string, password: string): Promise<UserLoginResult>;
    getUserByEmail(email: string): Promise<IUser | null>;
}
//# sourceMappingURL=userService.d.ts.map