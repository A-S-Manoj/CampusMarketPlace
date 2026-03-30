/**
 * Manual validation utility functions.
 * Keeps dependencies low and ensures data integrity.
 */

const isValidEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    // Simple email regex for common formats
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const isValidPassword = (password) => {
    // Check if password exists and is at least 6 characters
    if (!password || typeof password !== "string") return false;
    return password.length >= 6;
};

const isValidUsername = (username) => {
    // Username must be 3-30 chars, alphanumeric and underscores/dots
    if (!username || typeof username !== "string") return false;
    const re = /^[a-zA-Z0-9._]{3,30}$/;
    return re.test(username);
};

const isValidPrice = (price) => {
    // Price must be a number and non-negative
    const num = parseFloat(price);
    return !isNaN(num) && num >= 0;
};

const isValidString = (str, minLength = 1, maxLength = 1000) => {
    if (!str || typeof str !== "string") return false;
    const trimmed = str.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidUsername,
    isValidPrice,
    isValidString
};
