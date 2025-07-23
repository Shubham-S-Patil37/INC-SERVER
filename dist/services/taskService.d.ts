import { ITask } from '../schema/taskSchema';
export interface TaskCreateData {
    title: string;
    description?: string;
    status?: 'pending' | 'in-progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    assignedTo?: string;
    dueDate?: Date;
    createdBy: string;
}
export interface TaskUpdateData {
    title?: string;
    description?: string;
    status?: 'pending' | 'in-progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    assignedTo?: string;
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
export declare class TaskService {
    createTask(taskData: TaskCreateData): Promise<ITask>;
    getAllTasks(filters: TaskFilters): Promise<PaginatedTasks>;
    getTaskById(taskId: string): Promise<ITask | null>;
    updateTask(taskId: string, updateData: TaskUpdateData): Promise<ITask | null>;
    deleteTask(taskId: string): Promise<boolean>;
    getTasksByUser(userId: string, type?: 'created' | 'assigned', page?: number, limit?: number): Promise<PaginatedTasks>;
    updateTaskStatus(taskId: string, status: 'pending' | 'in-progress' | 'completed'): Promise<ITask | null>;
    getTaskStats(userId?: string): Promise<any>;
}
//# sourceMappingURL=taskService.d.ts.map