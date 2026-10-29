const express = require('express');
const { AuthMiddlewares } = require('../../middlewares');
const { UserController } = require('../../controllers');
const router = express.Router();


router.get(
    '/me',
    AuthMiddlewares.checkAuth,
    UserController.getProfile
);

module.exports = router;
