const express = require('express');
const { AuthController } = require('../../controllers');
const { AuthMiddlewares } = require('../../middlewares');

const router = express.Router();

router.post(
    '/login',
    AuthMiddlewares.validateAuthRequest,
    AuthController.signin
);

router.post(
    '/register',
    AuthController.signup
);


module.exports = router;
