const express = require('express');
const { SalaryController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router();

router.use(AuthMiddlewares.checkAuth);

// Admin: Manually trigger salary calculation for a specific employee or all employees
// Request Body: { employee_id?, month, year }
// Prevents duplicates: Returns 409 'Salary already processed for this selected month.'
router.post(
    '/generate',
    AuthMiddlewares.checkRole('admin'),
    SalaryController.generateSalary
);

// Admin: View all processed salary records with month and year filters
router.get(
    '/',
    AuthMiddlewares.checkRole('admin'),
    SalaryController.getAllSalaries
);

// Employee: View own historical salary payouts
router.get(
    '/my-salaries',
    AuthMiddlewares.checkRole('employee'),
    SalaryController.getMySalaries
);

module.exports = router;
