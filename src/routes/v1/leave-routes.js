const express = require('express');
const { LeaveController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router();

router.use(AuthMiddlewares.checkAuth);

// Employee: Apply for leave by selecting date and providing reason
router.post(
    '/',
    AuthMiddlewares.checkRole('employee'),
    LeaveController.applyLeave
);

// Employee: View own applied leaves
router.get(
    '/my-leaves',
    AuthMiddlewares.checkRole('employee'),
    LeaveController.getMyLeaves
);

// Admin: View all leave requests (with status, month, and year filters)
router.get(
    '/',
    AuthMiddlewares.checkRole('admin'),
    LeaveController.getAllLeaves
);

// Admin: Approve or Reject leave application
router.patch(
    '/:id/status',
    AuthMiddlewares.checkRole('admin'),
    LeaveController.updateLeaveStatus
);

module.exports = router;
