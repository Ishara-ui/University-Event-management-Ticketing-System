JavaScript;
const express = require("express");
const router = express.Router();
const {
  getAdminDashboardStats,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");
router.get(
  "/stats",
  protect,
  authorize("Club Admin", "Super Admin", "Finance Officer"),
  getAdminDashboardStats,
);
module.exports = router;
