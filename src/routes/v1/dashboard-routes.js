const express = require('express');
const { DashboardController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router();

router.use(AuthMiddlewares.checkAuth);

// Admin Dashboard: Total employees, attendance % per employee, month/year date filter
router.get(
    '/admin',
    AuthMiddlewares.checkRole('admin'),
    DashboardController.getAdminDashboard
);

// Employee Dashboard: Today's check-in status, attendance overview, recent leaves
router.get(
    '/employee',
    AuthMiddlewares.checkRole('employee'),
    DashboardController.getEmployeeDashboard
);

module.exports = router;
