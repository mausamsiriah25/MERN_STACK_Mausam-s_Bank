const User = require("../models/User");
const Transaction = require("../models/Transaction");

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const activeCustomers = await User.countDocuments({ role: "customer", status: "active" });
    const frozenCustomers = await User.countDocuments({ role: "customer", status: "frozen" });

    const depositAgg = await Transaction.aggregate([
      { $match: { type: "deposit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const withdrawAgg = await Transaction.aggregate([
      { $match: { type: "withdraw" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalTransactions = await Transaction.countDocuments();

    const recentCustomers = await User.find({ role: "customer" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email accountNumber balance status createdAt");

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("user", "name accountNumber");

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        activeCustomers,
        frozenCustomers,
        totalDeposits: depositAgg[0]?.total || 0,
        totalWithdrawals: withdrawAgg[0]?.total || 0,
        totalTransactions,
      },
      recentCustomers,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers (search + pagination)
// @route   GET /api/admin/customers
// @access  Private (admin)
const getCustomers = async (req, res, next) => {
  try {
    const { search = "", status, page = 1, limit = 10 } = req.query;

    const query = { role: "customer" };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { accountNumber: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const total = await User.countDocuments(query);
    const customers = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      customers,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single customer's full details + their transactions
// @route   GET /api/admin/customers/:id
// @access  Private (admin)
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: "customer" });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const transactions = await Transaction.find({ user: customer._id }).sort({ createdAt: -1 }).limit(20);

    res.status(200).json({ success: true, customer, transactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Freeze a customer's account
// @route   PUT /api/admin/customers/:id/freeze
// @access  Private (admin)
const freezeCustomer = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: "customer" });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    customer.status = "frozen";
    await customer.save();

    res.status(200).json({ success: true, message: `${customer.name}'s account has been frozen`, customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfreeze a customer's account
// @route   PUT /api/admin/customers/:id/unfreeze
// @access  Private (admin)
const unfreezeCustomer = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: "customer" });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    customer.status = "active";
    await customer.save();

    res.status(200).json({ success: true, message: `${customer.name}'s account has been unfrozen`, customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a customer account
// @route   DELETE /api/admin/customers/:id
// @access  Private (admin)
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: "customer" });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    await Transaction.deleteMany({ user: customer._id });
    await customer.deleteOne();

    res.status(200).json({ success: true, message: "Customer account deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions across the bank (search + filter + pagination)
// @route   GET /api/admin/transactions
// @access  Private (admin)
const getAllTransactions = async (req, res, next) => {
  try {
    const { type, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (type && type !== "all") query.type = type;
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { "counterparty.accountNumber": { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate("user", "name accountNumber")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  freezeCustomer,
  unfreezeCustomer,
  deleteCustomer,
  getAllTransactions,
};
