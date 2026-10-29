const express = require('express');
const { InfoController } = require('../../controllers');
const authRoutes = require('./auth-routes');
const userRoutes = require('./user-routes');
const employeeRoutes = require('./employee-routes');
const attendanceRoutes = require('./attendance-routes');
const leaveRoutes = require('./leave-routes');
const dashboardRoutes = require('./dashboard-routes');
const salaryRoutes = require('./salary-routes');

const router = express.Router();

router.get('/info', InfoController.info);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/salaries', salaryRoutes);

module.exports = router;