const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
console.log("🔥 NEW adminRoutes file loaded");
router.get("/transaction-summary", authMiddleware, roleMiddleware("admin"), adminController.getTransactionSummary);
router.get("/monthly-transactions", authMiddleware, roleMiddleware("admin"), adminController.getMonthlyTransactions);
router.get("/recent-transactions", adminController.getRecentTransactions);
// Admin Stats
router.get("/stats", authMiddleware, roleMiddleware("admin"), adminController.getAdminStats);

// Get all users
router.get("/users", authMiddleware, roleMiddleware("admin"), adminController.getAllUsers);

// Freeze account
router.put("/freeze/:id", authMiddleware, roleMiddleware("admin"), adminController.freezeAccount);

// Unfreeze account
router.put("/unfreeze/:id", authMiddleware, roleMiddleware("admin"), adminController.unfreezeAccount);

module.exports = router;