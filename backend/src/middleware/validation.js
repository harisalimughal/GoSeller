const validateRequest = (req, res, next) => {
  // Simple validation middleware
  next();
};

module.exports = { validateRequest };
