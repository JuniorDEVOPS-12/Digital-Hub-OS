/* ========================================
   Digital Hub OS — Application Errors
   ======================================== */

export const ErrorCodes = {
    VALIDATION: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    STORAGE: 'STORAGE_ERROR',
    BUSINESS_RULE: 'BUSINESS_RULE_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR',
};

export class AppError extends Error {
    constructor(message, code = ErrorCodes.UNKNOWN, details = null) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.details = details;
    }
}
