const crypto = require("crypto");

/**
 * Generates a unique transaction ID
 * Format: TXN-<timestamp>-<random hex>
 */
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

module.exports = generateTransactionId;
