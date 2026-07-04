const express = require("express");
const {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  freezeCustomer,
  unfreezeCustomer,
  deleteCustomer,
  getAllTransactions,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/customers", getCustomers);
router.get("/customers/:id", getCustomerById);
router.put("/customers/:id/freeze", freezeCustomer);
router.put("/customers/:id/unfreeze", unfreezeCustomer);
router.delete("/customers/:id", deleteCustomer);
router.get("/transactions", getAllTransactions);

module.exports = router;
