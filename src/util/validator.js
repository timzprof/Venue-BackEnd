import {validationResult} from 'express-validator';

export default (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Error');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }
  return next();
};
