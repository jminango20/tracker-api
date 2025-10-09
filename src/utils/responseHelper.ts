import { Response } from 'express';

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  message?: string;
  metadata?: ResponseMetadata;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  code?: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Response metadata (pagination, timestamps, etc.)
 */
export interface ResponseMetadata {
  timestamp?: string;
  requestId?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  [key: string]: unknown;
}

/**
 * Response Helper Class
 */
export class ResponseHelper {
  /**
   * Send successful response
   */
  static sendSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200,
    metadata?: ResponseMetadata
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
      ...(metadata && { metadata }),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static sendError(
    res: Response,
    errorMessage: string,
    statusCode: number = 400,
    errorCode?: string,
    details?: Record<string, unknown>
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        message: errorMessage,
        ...(errorCode && { code: errorCode }),
        ...(details && { details }),
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error (400)
   */
  static sendValidationError(
    res: Response,
    errorMessage: string,
    details?: Record<string, unknown>
  ): Response {
    return this.sendError(res, errorMessage, 400, 'VALIDATION_ERROR', details);
  }

  /**
   * Send not found error (404)
   */
  static sendNotFound(
    res: Response,
    errorMessage: string = 'Resource not found',
    details?: Record<string, unknown>
  ): Response {
    return this.sendError(res, errorMessage, 404, 'NOT_FOUND', details);
  }

  /**
   * Send unauthorized error (401)
   */
  static sendUnauthorized(
    res: Response,
    errorMessage: string = 'Unauthorized',
    details?: Record<string, unknown>
  ): Response {
    return this.sendError(res, errorMessage, 401, 'UNAUTHORIZED', details);
  }

  /**
   * Send forbidden error (403)
   */
  static sendForbidden(
    res: Response,
    errorMessage: string = 'Forbidden',
    details?: Record<string, unknown>
  ): Response {
    return this.sendError(res, errorMessage, 403, 'FORBIDDEN', details);
  }

  /**
   * Send conflict error (409)
   */
  static sendConflict(
    res: Response,
    errorMessage: string = 'Resource already exists',
    details?: Record<string, unknown>
  ): Response {
    return this.sendError(res, errorMessage, 409, 'CONFLICT', details);
  }

  /**
   * Send internal server error (500)
   */
  static sendServerError(
    res: Response,
    errorMessage: string = 'Internal server error',
    details?: Record<string, unknown>
  ): Response {
    return this.sendError(res, errorMessage, 500, 'INTERNAL_SERVER_ERROR', details);
  }

  /**
   * Send service unavailable error (503)
   */
  static sendServiceUnavailable(
    res: Response,
    errorMessage: string = 'Service temporarily unavailable',
    details?: Record<string, unknown>
  ): Response {
    return this.sendError(res, errorMessage, 503, 'SERVICE_UNAVAILABLE', details);
  }

  /**
   * Send paginated response
   */
  static sendPaginatedSuccess<T>(
    res: Response,
    data: T[],
    page: number,
    pageSize: number,
    total: number,
    message?: string
  ): Response {
    const totalPages = Math.ceil(total / pageSize);

    return this.sendSuccess(
      res,
      data,
      message,
      200,
      {
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      }
    );
  }

  /**
   * Send created response (201)
   */
  static sendCreated<T>(
    res: Response,
    data: T,
    message?: string,
    metadata?: ResponseMetadata
  ): Response {
    return this.sendSuccess(res, data, message, 201, metadata);
  }

  /**
   * Send accepted response (202)
   */
  static sendAccepted<T>(
    res: Response,
    data: T,
    message?: string,
    metadata?: ResponseMetadata
  ): Response {
    return this.sendSuccess(res, data, message, 202, metadata);
  }

  /**
   * Send no content response (204)
   */
  static sendNoContent(res: Response): Response {
    return res.status(204).send();
  }
}