const Answer = require("../models/answer");

function authorization (req, res, next) {
    Answer.findById(req.params.id)
    .then((found) => {
        if (found) {
            if (found.UserId == req.user._id){
                next();
            }
            else {
                let err = { status: 401, message: `You are not authorized` }
                next(err);
            }
        }
        else {
            let err = { status: 404, message: `Answer not found` }
            next(err);
        }
    })
    .catch((err) => {
        /* istanbul ignore next */
        next(err);
    });
}

module.exports = authorization;