/**
 * Wrapper function to catch async errors in Express routes
 * Eliminates the need for try-catch blocks in every route handler
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { catchAsync };
