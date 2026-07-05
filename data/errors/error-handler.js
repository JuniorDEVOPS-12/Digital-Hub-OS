/* ========================================
   Digital Hub OS — Centralized Error Handler
   ======================================== */

import { AppError, ErrorCodes } from './app-error.js';

export class ErrorHandler {
    /**
     * Exécute une opération et normalise toute erreur en AppError.
     * @template T
     * @param {() => T} operation
     * @returns {T}
     */
    static execute(operation) {
        try {
            return operation();
        } catch (err) {
            throw ErrorHandler.normalize(err);
        }
    }

    /**
     * @param {unknown} err
     * @returns {AppError}
     */
    static normalize(err) {
        if (err instanceof AppError) {
            return err;
        }

        if (err instanceof Error) {
            return new AppError(err.message, ErrorCodes.UNKNOWN, { original: err.name });
        }

        return new AppError(String(err), ErrorCodes.UNKNOWN);
    }

    /**
     * @param {unknown} err
     * @returns {string}
     */
    static getMessage(err) {
        return ErrorHandler.normalize(err).message;
    }
}

/**
 * Enveloppe une méthode de service pour la gestion centralisée des erreurs.
 * @param {Function} fn
 * @returns {Function}
 */
export function withErrorHandling(fn) {
    return (...args) => ErrorHandler.execute(() => fn(...args));
}
