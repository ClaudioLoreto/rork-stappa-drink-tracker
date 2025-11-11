const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {object} payload - User data to encode
 * @param {string} expiresIn - Token expiration time (default: 30d)
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = '30d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};
