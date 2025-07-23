import { Request, Response } from 'express';
export declare class TaskController {
    private taskService;
    constructor();
    createTask: (req: Request, res: Response) => Promise<void>;
    getAllTasks: (req: Request, res: Response) => Promise<void>;
    getTaskById: (req: Request, res: Response) => Promise<void>;
    updateTask: (req: Request, res: Response) => Promise<void>;
    deleteTask: (req: Request, res: Response) => Promise<void>;
    getTasksByUser: (req: Request, res: Response) => Promise<void>;
    updateTaskStatus: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=taskController.d.ts.map