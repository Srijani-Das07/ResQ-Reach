const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get token from headers
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token, authorization denied.' });
  }
};

module.exports = authMiddleware;