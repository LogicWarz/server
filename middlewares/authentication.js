const User = require("../models/user");
const jwt = require("../helpers/jwt");

function authentication (req, res, next) {
    try {
        const decoded = jwt.verify(req.headers.token);
        User.findOne({
            email: decoded.email
        })
        .then((user) => {
            /* istanbul ignore next */
            if (user) {
                req.user = decoded;
                next();
            } else {
                /* istanbul ignore next */
                let err = { status: 404, message: `User not found` }
                /* istanbul ignore next */
                next(err);
            }
        });
    }
    catch (err) {
        err = { status: 403, message: `You must log in first` }
        next(err);
    }
}

module.exports = authentication;