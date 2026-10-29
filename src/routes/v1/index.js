const express = require('express');
const { InfoController } = require('../../controllers');
const authRoutes = require('./auth-routes');
const userRoutes = require('./user-routes')

const router = express.Router();


router.get('/info', InfoController.info);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;