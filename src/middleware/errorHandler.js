const responseFormatter = require('../utils/responseFormatter');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message
    }));
    return res
      .status(400)
      .json(responseFormatter.error('Validation failed', 400, errors));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
    return res
      .status(409)
      .json(responseFormatter.error('Duplicate entry', 409, errors));
  }

  return res.status(statusCode).json(responseFormatter.error(message, statusCode));
}

function notFoundHandler(req, res, next) {
  res
    .status(404)
    .json(responseFormatter.error(`Route ${req.method} ${req.path} not found`, 404));
}

module.exports = {
  errorHandler,
  notFoundHandler
};
