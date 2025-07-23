const jwt = require('jsonwebtoken');
const { tokenBlacklist } = require('../utils/tokenBlacklist');

const verifyToken = (req, res, next) => {
  //const token = req.cookies.token;
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token || tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attaching user data to the request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyToken;