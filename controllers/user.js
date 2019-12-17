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
                /* istanbul ignore next */
                next(err);
            });
    }
    static gsignin(req, res, next) {
        User.findOne({
            email: req.user.email
        })
            /* istanbul ignore next */
            .then((user) => {
                /* istanbul ignore next */
                if (user) {
                    return user;
                } 
                /* istanbul ignore next */
                else {
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
                /* istanbul ignore next */
                next(err);
            });
    }
    static findAll(req, res, next) {
        User.find()
            .then((users) => {
                res.status(200).json(users);
            })
            .catch((err) => {
                /* istanbul ignore next */
                next(err);
            });
    }
    static findOne(req, res, next) {
        User.findById(req.user._id)
            .then((user) => {
                /* istanbul ignore next */
                if (user) {
                    res.status(200).json(user);
                } 
                /* istanbul ignore next */
                else {
                    let err = { status: 403, message: `You must log in first` };
                    next(err);
                }
            })
            .catch((err) => {
                /* istanbul ignore next */
                next(err);
            });
    }
    static updatePoints (req, res, next) {
        User.findById(req.params.id)
            .then((user) => {
                /* istanbul ignore next */
                if (user) {
                    return User.findByIdAndUpdate(req.params.id, 
                        { $set: {
                            points: user.points + req.body.points,
                        }}, { 
                            omitUndefined: true, 
                            runValidators:true, 
                            new: true 
                        }); 
                } 
                else {
                    let err = { status: 404, message: `User not found` };
                    throw err;
                }
            })
            .then((updated) => {
                res.status(200).json(updated);
            })
            .catch((err) => {
                /* istanbul ignore next */
                next(err);
            });
    }
    
}

module.exports = UserController;