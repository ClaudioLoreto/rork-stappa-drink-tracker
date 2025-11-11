/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {object} Validation result
 */
const validateUsername = (username) => {
  const errors = [];

  if (!username || username.length === 0) {
    errors.push('Username is required');
  }

  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (!/^[A-Za-z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid
 */
const validatePhone = (phone) => {
  // Basic validation for Italian phone numbers
  const phoneRegex = /^[+]?[0-9\s\-()]{8,20}$/;
  return phoneRegex.test(phone);
};

/**
 * Check if promo is valid
 * @param {object} promo - Promo object
 * @returns {boolean} True if valid
 */
const isPromoValid = (promo) => {
  if (!promo || !promo.isActive) return false;
  
  const now = new Date();
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);
  
  return now >= start && now <= end;
};

module.exports = {
  validateUsername,
  validateEmail,
  validatePhone,
  isPromoValid
};
