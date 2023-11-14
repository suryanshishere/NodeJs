const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Valiation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12)
        .then(hashedPw => {
            const user = new User({
                email: email,
                password: hashedPw,
                name: name
            });

            return user.save();
        })
        .then(result => {
            res.status(201).json({ message: "user created!", userId: result._id })
        })
        .catch(err => next(err));
}


exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                const error = new Error('A user with this email count not be found.');
                error.statusCode = 401;
                throw error;
            }

            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password!');
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, 'superkeysuper', { expiresIn: '1h' });

            res.status(200).json({ token: token, userId: loadedUser._id.toString() });
        })
        .catch(err => next(err));

}

exports.status = (req, res, next) => {
    User.findOne(req.userId)
        .then(user => {

            if (!user) {
                const error = new Error('A user with this email count not be found.');
                error.statusCode = 401;
                throw error;
            }
            const status = user.status;
            res.status(200).json({ status: status })
        })
        .catch(err => next(err));
}

exports.updateStatus = (req, res, next) => {
    User.findOne(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error('A user with the email could not be found.');
                error.statusCode = 401;
                throw error;
            }

            if (user.toString() !== req.userId) {
                const error = new Error('Not authorised!');
                error.statusCode = 403;
                throw error;
            }

            user.status = req.body.status;
            return user.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Status updated!', post: result });
        })
        .catch(err => next(err))
}