// Express 4 doesn't catch a rejected promise from an async route handler —
// without this, a thrown error in any controller would hang the request
// instead of reaching errorHandler.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
