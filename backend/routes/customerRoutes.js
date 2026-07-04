const express = require("express");
const { body } = require("express-validator");
const {
  getDashboard,
  deposit,
  withdraw,
  transfer,
  getTransactions,
  updateProfile,
  changePassword,
  verifyAccount,
} = require("../controllers/customerController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("customer"));

router.get("/dashboard", getDashboard);

router.post(
  "/deposit",
  [body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than zero")],
  deposit
);

router.post(
  "/withdraw",
  [body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than zero")],
  withdraw
);

router.post(
  "/transfer",
  [
    body("receiverAccountNumber").notEmpty().withMessage("Receiver account number is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than zero"),
  ],
  transfer
);

router.get("/verify-account/:accountNumber", verifyAccount);
router.get("/transactions", getTransactions);
router.put("/profile", updateProfile);
router.put(
  "/change-password",
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  changePassword
);

module.exports = router;
