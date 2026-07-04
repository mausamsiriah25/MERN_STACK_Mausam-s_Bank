const User = require("../models/User");

/**
 * Generates a unique 12-digit account number prefixed with "MB"
 * Format: MB + 10 random digits
 */
const generateAccountNumber = async () => {
  let accountNumber;
  let exists = true;

  while (exists) {
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    accountNumber = `MB${randomDigits}`;
    exists = await User.findOne({ accountNumber });
  }

  return accountNumber;
};

module.exports = generateAccountNumber;
