const express = require('express');
const { AttendanceController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router();

// Base authentication required for all attendance endpoints
router.use(AuthMiddlewares.checkAuth);

// Employee: Submit / Log daily working hours
router.post(
    '/',
    AuthMiddlewares.checkRole('employee'),
    AttendanceController.logAttendance
);

// Employee: View own attendance records and calculated percentage
router.get(
    '/my-attendance',
    AuthMiddlewares.checkRole('employee'),
    AttendanceController.getMyAttendance
);

// Admin: View specific employee's attendance records
router.get(
    '/employee/:employeeId',
    AuthMiddlewares.checkRole('admin'),
    AttendanceController.getEmployeeAttendance
);

// Admin: View all attendances with month & year filter
router.get(
    '/',
    AuthMiddlewares.checkRole('admin'),
    AttendanceController.getAllAttendance
);

module.exports = router;
