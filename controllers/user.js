const User = require("../models/user");
const bcrypt = require("../helpers/bcrypt");
const jwt = require("../helpers/jwt");

class UserController {
    static signup(req, res, next) {
        User.create({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name
        })
            .then((user) => {
                const user_data = { _id: user._id, name: user.name, email: user.email, points: user.points };
                const token = jwt.sign({ _id: user._id, name: user.name, email: user.email, points: user.points });
                res.status(201).json({ user_data, token });
            })
            .catch((err) => {
                next(err);
            });
    }
    static signin(req, res, next) {
        User.findOne({
            email: req.body.email
        })
            .then((user) => {
                if (user && bcrypt.compare(req.body.password, user.password)) {
                    const user_data = { _id: user._id, name: user.name, email: user.email, points: user.points };
                    const token = jwt.sign({ _id: user._id, name: user.name, email: user.email, points: user.points });
                    res.status(200).json({ user_data, token });
                } else {
                    let err = { status: 401, message: `Email address / password is incorrect` };
                    next(err);
                }
            })
            .catch((err) => {
                next(err);
            });
    }
    static findOne(req, res, next) {
        User.findById(req.user._id)
            .then((user) => {
                if (user) {
                    res.status(200).json(user);
                } else {
                    let err = { status: 403, message: `You must log in first` };
                    next(err);
                }
            })
            .catch((err) => {
                next(err);
            });
    }
    static gsignin(req, res, next) {
        User.findOne({
            email: req.user.email
        })
            .then((user) => {
                if (user) {
                    return user;
                } else {
                    return User.create({
                        email: req.user.email,
                        password: process.env.DEFAULT_PASSWORD,
                        name: req.user.name,
                    });
                }
            })
            .then((verified) => {
                const user_data = { _id: verified._id, name: verified.name, email: verified.email, points: verified.points };
                const token = jwt.sign({ _id: verified._id, name: verified.name, email: verified.email, points: verified.points });
                res.status(200).json({ user_data, token });
            })
            .catch((err) => {
                next(err);
            });
    }
}

module.exports = UserController;