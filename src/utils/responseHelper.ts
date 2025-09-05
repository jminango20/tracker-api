import { Response } from 'express';
import { ApiResponse } from '../types/apiTypes';

export class ResponseHelper {
    static sendSuccess<T>(res: Response, data: T, message?: string, statusCode: number = 200) {
        return res.status(statusCode).json({
            success: true,
            data
        } as ApiResponse<T>);
    }

    static sendError(res: Response, error: string, statusCode: number = 400) {
        return res.status(statusCode).json({
            success: false,
            error
        } as ApiResponse);
    }

    static sendValidationError(res: Response, error: string) {
        return this.sendError(res, error, 400);
    }

    static sendNotFound(res: Response, error: string) {
        return this.sendError(res, error, 404);
    }

    static sendServerError(res: Response, error: string = 'Erro interno do servidor') {
        return this.sendError(res, error, 500);
    }
}