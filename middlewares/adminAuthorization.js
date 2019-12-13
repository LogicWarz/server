const User = require("../models/user");

function authorization (req, res, next) {
    User.findById(req.user._id)
    .then((found) => {
        if (found.admin) {
            next();
        }
        else {
            let err = { status: 404, message: `You are not admin` }
            next(err);
        }
    })
    .catch((err) => {
        next(err);
    });
}

module.exports = authorization;