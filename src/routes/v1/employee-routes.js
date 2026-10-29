const express = require('express');
const { EmployeeController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router();

// All employee management routes are restricted to Admin
router.use(AuthMiddlewares.checkAuth);
router.use(AuthMiddlewares.checkRole('admin'));

// Employees Page: List all employees (with search and pagination)
router.get('/', EmployeeController.getAllEmployees);

// Get single employee details
router.get('/:id', EmployeeController.getEmployeeById);

// Create / Onboard new employee
router.post('/', EmployeeController.createEmployee);

// Update employee details
router.put('/:id', EmployeeController.updateEmployee);

// Delete employee
router.delete('/:id', EmployeeController.deleteEmployee);

module.exports = router;
