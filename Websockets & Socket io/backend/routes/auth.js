const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authControllers = require('../controllers/auth');
const User = require('../models/user');

router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('E-Mail address already exists!');
                    }
                })
                .catch(err => next(err))
        })
        .normalizeEmail(),
    body('name')
        .trim()
        .not()
        .isEmpty()
], authControllers.signup);

router.post('/login', authControllers.login)

router.get('/status', authControllers.status);

router.put('/status', authControllers.updateStatus)

module.exports = router;