/**
 * Base custom error class for standardized error handling.
 */
export class AppError extends Error {
  constructor(message, statusCode, name = "AppError") {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 — Bad Request
export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400, "BadRequestError");
  }
}

// 401 — Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UnauthorizedError");
  }
}

// 403 — Forbidden
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "ForbiddenError");
  }
}

// 404 — Not Found
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NotFoundError");
  }
}

// 409 — Conflict
export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409, "ConflictError");
  }
}

// 422 — Unprocessable Entity
export class ValidationError extends AppError {
  constructor(message = "Validation Error") {
    super(message, 422, "ValidationError");
  }
}

// 429 — Too Many Requests
export class TooManyRequestsError extends AppError {
  constructor(message = "Too Many Requests") {
    super(message, 429, "TooManyRequestsError");
  }
}

// 500 — Internal Server Error
export class ServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500, "ServerError");
  }
}

// 502 — Bad Gateway
export class BadGatewayError extends AppError {
  constructor(message = "Bad Gateway") {
    super(message, 502, "BadGatewayError");
  }
}

// 503 — Service Unavailable
export class ServiceUnavailableError extends AppError {
  constructor(message = "Service Unavailable") {
    super(message, 503, "ServiceUnavailableError");
  }
}
