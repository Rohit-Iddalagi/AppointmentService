const responseFormatter = require('../utils/responseFormatter');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (!error) {
    return next();
  }

  const errors = error.details.map((detail) => ({
    field: detail.path.join('.'),
    message: detail.message
  }));

  return res
    .status(400)
    .json(responseFormatter.error('Validation failed', 400, errors));
};

module.exports = validate;
