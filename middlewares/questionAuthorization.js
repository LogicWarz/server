const Question = require("../models/question");

function authorization (req, res, next) {
    Question.findById(req.params.id)
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
            let err = { status: 404, message: `Question not found` }
            next(err);
        }
    })
    .catch((err) => {
        next(err);
    });
}

module.exports = authorization;