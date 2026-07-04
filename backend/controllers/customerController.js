const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const generateTransactionId = require("../utils/generateTransactionId");

const DAILY_WITHDRAWAL_LIMIT = Number(process.env.DAILY_WITHDRAWAL_LIMIT) || 50000;

// @desc    Get dashboard summary (balance, account info, recent transactions)
// @route   GET /api/customer/dashboard
// @access  Private (customer)
const getDashboard = async (req, res, next) => {
  try {
    const recentTransactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      user: req.user,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deposit money
// @route   POST /api/customer/deposit
// @access  Private (customer)
const deposit = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { amount, note } = req.body;
    const depositAmount = Number(amount);

    const user = await User.findById(req.user._id);
    user.balance += depositAmount;
    await user.save();

    const transaction = await Transaction.create({
      transactionId: generateTransactionId(),
      user: user._id,
      type: "deposit",
      amount: depositAmount,
      balanceAfter: user.balance,
      note: note || "Cash deposit",
    });

    res.status(200).json({
      success: true,
      message: `₹${depositAmount.toLocaleString("en-IN")} deposited successfully`,
      balance: user.balance,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw money
// @route   POST /api/customer/withdraw
// @access  Private (customer)
const withdraw = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { amount, note } = req.body;
    const withdrawAmount = Number(amount);

    const user = await User.findById(req.user._id);

    if (withdrawAmount > user.balance) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // Check daily withdrawal limit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaysWithdrawals = await Transaction.aggregate([
      {
        $match: {
          user: user._id,
          type: "withdraw",
          createdAt: { $gte: startOfDay },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const alreadyWithdrawnToday = todaysWithdrawals[0]?.total || 0;

    if (alreadyWithdrawnToday + withdrawAmount > DAILY_WITHDRAWAL_LIMIT) {
      return res.status(400).json({
        success: false,
        message: `Daily withdrawal limit of ₹${DAILY_WITHDRAWAL_LIMIT.toLocaleString("en-IN")} exceeded. You have already withdrawn ₹${alreadyWithdrawnToday.toLocaleString("en-IN")} today.`,
      });
    }

    user.balance -= withdrawAmount;
    await user.save();

    const transaction = await Transaction.create({
      transactionId: generateTransactionId(),
      user: user._id,
      type: "withdraw",
      amount: withdrawAmount,
      balanceAfter: user.balance,
      note: note || "Cash withdrawal",
    });

    res.status(200).json({
      success: true,
      message: `₹${withdrawAmount.toLocaleString("en-IN")} withdrawn successfully`,
      balance: user.balance,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer money to another account
// @route   POST /api/customer/transfer
// @access  Private (customer)
const transfer = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { receiverAccountNumber, amount, note } = req.body;
    const transferAmount = Number(amount);

    if (receiverAccountNumber === req.user.accountNumber) {
      return res.status(400).json({ success: false, message: "You cannot transfer money to your own account" });
    }

    const receiver = await User.findOne({ accountNumber: receiverAccountNumber });
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver account not found" });
    }

    if (receiver.status === "frozen") {
      return res.status(400).json({ success: false, message: "Receiver account is frozen and cannot accept funds" });
    }

    const sender = await User.findById(req.user._id);
    if (transferAmount > sender.balance) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    let senderTxn, receiverTxn;

    await session.withTransaction(async () => {
      sender.balance -= transferAmount;
      receiver.balance += transferAmount;

      await sender.save({ session });
      await receiver.save({ session });

      const sharedNote = note || "Fund transfer";

      senderTxn = await Transaction.create(
        [
          {
            transactionId: generateTransactionId(),
            user: sender._id,
            type: "transfer-out",
            amount: transferAmount,
            balanceAfter: sender.balance,
            note: sharedNote,
            counterparty: { name: receiver.name, accountNumber: receiver.accountNumber },
          },
        ],
        { session }
      );

      receiverTxn = await Transaction.create(
        [
          {
            transactionId: generateTransactionId(),
            user: receiver._id,
            type: "transfer-in",
            amount: transferAmount,
            balanceAfter: receiver.balance,
            note: sharedNote,
            counterparty: { name: sender.name, accountNumber: sender.accountNumber },
          },
        ],
        { session }
      );
    });

    res.status(200).json({
      success: true,
      message: `₹${transferAmount.toLocaleString("en-IN")} transferred to ${receiver.name} successfully`,
      balance: sender.balance,
      transaction: senderTxn[0],
    });
  } catch (error) {
    // Fallback for standalone MongoDB instances without replica sets (transactions unsupported)
    if (error.message && error.message.includes("Transaction numbers")) {
      return res.status(500).json({
        success: false,
        message:
          "This MongoDB instance does not support multi-document transactions (requires a replica set). See README troubleshooting section.",
      });
    }
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Get transaction history (search, filter, sort, paginate)
// @route   GET /api/customer/transactions
// @access  Private (customer)
const getTransactions = async (req, res, next) => {
  try {
    const { type, search, sort = "-createdAt", page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };

    if (type && type !== "all") {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { note: { $regex: search, $options: "i" } },
        { "counterparty.name": { $regex: search, $options: "i" } },
        { "counterparty.accountNumber": { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sort)
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

// @desc    Update profile (phone, address, avatar)
// @route   PUT /api/customer/profile
// @access  Private (customer)
const updateProfile = async (req, res, next) => {
  try {
    const { phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (phone) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/customer/change-password
// @access  Private (customer)
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a receiver account exists (used before transfer confirmation)
// @route   GET /api/customer/verify-account/:accountNumber
// @access  Private (customer)
const verifyAccount = async (req, res, next) => {
  try {
    const { accountNumber } = req.params;
    const receiver = await User.findOne({ accountNumber, role: "customer" }).select("name accountNumber status");

    if (!receiver) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    res.status(200).json({
      success: true,
      receiver: { name: receiver.name, accountNumber: receiver.accountNumber, status: receiver.status },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  deposit,
  withdraw,
  transfer,
  getTransactions,
  updateProfile,
  changePassword,
  verifyAccount,
};
