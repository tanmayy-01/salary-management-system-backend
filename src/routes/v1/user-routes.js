const express = require('express');
const { AuthMiddlewares } = require('../../middlewares');
const { AuthController } = require('../../controllers');
const router = express.Router();


router.get(
    '/me',
    AuthMiddlewares.checkAuth,
    AuthController.getProfile
);

module.exports = router;
