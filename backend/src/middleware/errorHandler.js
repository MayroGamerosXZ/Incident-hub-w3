// Middleware Centralizado de Manejo de Errores HTTP y Wrapper Asíncrono (DT-2 - AB#15, AB#27)

class AppError extends Error {
  constructor(message, statusCode = 400, details = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = Array.isArray(details) ? details : [details];
  }
}

/**
 * Envuelve controladores async de Express 4 para propagar rechazos de promesas hacia next(err)
 */
function asyncHandler(fn) {
  return function wrappedAsyncHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Manejador global de errores HTTP que evita fugas de stack traces (OWASP A05)
 */
function errorHandlerMiddleware(err, req, res, _next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Payload JSON malformado',
      status: 400,
      timestamp: new Date().toISOString(),
      path: req.originalUrl || req.url
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const isServerError = statusCode >= 500;

  if (isServerError && process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR ${statusCode}] ${req.method} ${req.originalUrl}:`, err.message);
  }

  const response = {
    error: isServerError && process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : (err.message || 'Error interno del servidor'),
    status: statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.url
  };

  if (err.details && err.details.length > 0) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  AppError,
  asyncHandler,
  errorHandlerMiddleware
};
