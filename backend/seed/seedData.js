// Run with: npm run seed  (from the backend folder)
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const generateAccountNumber = require("../utils/generateAccountNumber");
const generateTransactionId = require("../utils/generateTransactionId");

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing existing users and transactions...");
    await User.deleteMany({});
    await Transaction.deleteMany({});

    console.log("👤 Creating admin account...");
    await User.create({
      name: "Bank Administrator",
      email: "admin@mausamsbank.com",
      password: "Admin@123",
      phone: "9800000000",
      role: "admin",
      accountType: "Savings",
    });

    console.log("👤 Creating demo customers...");

    const acc1 = await generateAccountNumber();
    const customer1 = await User.create({
      name: "Mausam Sharma",
      email: "customer@mausamsbank.com",
      password: "Customer@123",
      phone: "9811111111",
      address: "Kathmandu, Nepal",
      accountNumber: acc1,
      accountType: "Savings",
      balance: 25000,
    });

    const acc2 = await generateAccountNumber();
    const customer2 = await User.create({
      name: "Ritika Gurung",
      email: "ritika@mausamsbank.com",
      password: "Customer@123",
      phone: "9822222222",
      address: "Pokhara, Nepal",
      accountNumber: acc2,
      accountType: "Current",
      balance: 12500,
    });

    const acc3 = await generateAccountNumber();
    await User.create({
      name: "Suman Thapa",
      email: "suman@mausamsbank.com",
      password: "Customer@123",
      phone: "9833333333",
      address: "Lalitpur, Nepal",
      accountNumber: acc3,
      accountType: "Savings",
      balance: 5000,
      status: "frozen",
    });

    console.log("💸 Creating demo transactions...");

    await Transaction.create([
      {
        transactionId: generateTransactionId(),
        user: customer1._id,
        type: "deposit",
        amount: 20000,
        balanceAfter: 20000,
        note: "Initial deposit",
      },
      {
        transactionId: generateTransactionId(),
        user: customer1._id,
        type: "deposit",
        amount: 8000,
        balanceAfter: 28000,
        note: "Salary credit",
      },
      {
        transactionId: generateTransactionId(),
        user: customer1._id,
        type: "withdraw",
        amount: 3000,
        balanceAfter: 25000,
        note: "ATM withdrawal",
      },
      {
        transactionId: generateTransactionId(),
        user: customer2._id,
        type: "deposit",
        amount: 15000,
        balanceAfter: 15000,
        note: "Initial deposit",
      },
      {
        transactionId: generateTransactionId(),
        user: customer2._id,
        type: "withdraw",
        amount: 2500,
        balanceAfter: 12500,
        note: "Bill payment",
      },
    ]);

    console.log("✅ Seed data created successfully!\n");
    console.log("----------------------------------------");
    console.log("Admin login:    admin@mausamsbank.com / Admin@123");
    console.log("Customer login: customer@mausamsbank.com / Customer@123");
    console.log("Customer login: ritika@mausamsbank.com / Customer@123");
    console.log("Customer login: suman@mausamsbank.com (frozen) / Customer@123");
    console.log("----------------------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
