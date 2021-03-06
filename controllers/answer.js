const Question = require("../models/question");
const Answer = require("../models/answer");

class AnswerController {
    static findAll (req, res, next) {
        Answer.find()
        .populate("QuestionId")
        .populate("UserId", "-password")
        .sort({
            createdAt: "DESC"
        })
        .then((answers) => {
            res.status(200).json(answers);
        })
        .catch((err) => {
            /* istanbul ignore next */
            next(err);
        });
    }

    static findUser (req, res, next) {
        Answer.find({
            UserId: req.user._id
        })
        .populate({
            path: "QuestionId",
            model: "Question",
            options: {
                sort: {
                    createdAt: "DESC"
                }
            },

                populate: {
                path: "UserId",
                model: "User"
            }
        })
        .populate("UserId", "-password")
        .sort({
            createdAt: "DESC"
        })
        .then((answers) => {
            res.status(200).json(answers);
        })
        .catch((err) => {
            /* istanbul ignore next */
            next(err);
        });
    }

    static findQuestion (req, res, next) {
        Answer.find({
            QuestionId: req.params.id
        })
        .populate("QuestionId")
        .populate("UserId", "-password")
        .sort({
            createdAt: "DESC"
        })
        .then((answers) => {
            res.status(200).json(answers);
        })
        .catch((err) => {
            /* istanbul ignore next */
            next(err);
        });
    }

    static findOne (req, res, next) {
        Answer.findById(req.params.id)
        .populate("QuestionId")
        .populate("UserId", "-password")
        .then((answer) => {
            if (answer) {
                res.status(200).json(answer);
            } 
            else{
                let err = { status: 404, message: `Answer not found` };
                next(err);
            }
        })
        .catch((err) => {
            /* istanbul ignore next */
            next(err);
        });
    }

    static create (req, res, next) {
        let created = "";
        Question.findById(req.body.QuestionId)
        .then((question) => {
            if (question) {
                return Answer.create({
                    QuestionId: req.body.QuestionId,
                    description: req.body.description,
                    UserId: req.user._id
                });
            }
            else{
                let err = { status: 404, message: `Question not found` }
                next(err);
            }
        })
        .then((answer) => {
            return answer.populate("UserId", "-password").execPopulate();
        })
        .then((populated) => {
            created = populated;
            return Question.findOneAndUpdate({ _id: req.body.QuestionId }, { $push: { answers: populated._id } });
        })
        .then((updated) => {
            res.status(201).json(created);
        })
        .catch((err) => {
            next(err);
        });
    }

    static update (req, res, next) {
        Answer.findByIdAndUpdate(req.params.id, 
        { $set: {
            description: req.body.description,
        }}, { 
            omitUndefined: true, 
            runValidators:true, 
            new: true 
        })
        .populate("QuestionId")
        .populate("UserId", "-password")
        .then((answer) => {
            /* istanbul ignore next */
            if (answer) {
                res.status(200).json(answer);
            } 
            else{
                let err = { status: 404, message: `Answer not found` }
                next(err);
            }
        })
        .catch((err) => {
            next(err);
        });
    }
    
    static delete (req, res, next) {
        Answer.findByIdAndDelete(req.params.id)
        /* istanbul ignore next */
        .then((answer) => {

            /* istanbul ignore next */
            if (answer) {
                return Question.findByIdAndUpdate(answer.QuestionId, { $pull: { answers: answer._id } });
            }
            /* istanbul ignore next */
            else {
                let err = { status: 404, message: `Answer not found` };
                next(err);
            }
        })
        .then((deleted) => {
            res.status(200).json({ message: "Answer deleted successfully" });
        })
        .catch((err) => {
            /* istanbul ignore next */
            next(err);
        });
    }

    static upvote(req, res, next) {
        Answer.findById(req.params.id)
        .then((answer) => {
            if (answer) {
                if (answer.UserId != req.user._id) {
                    if (answer.upvotes.includes(req.user._id) === false) {
                        const downvote = answer.downvotes.indexOf(req.user._id);
                        if (downvote >= 0) {
                            answer.downvotes.splice(downvote, 1);
                        }
                        answer.upvotes.push(req.user._id);
                        return answer.save();
                    } else {
                        const index = answer.upvotes.indexOf(req.user._id);
                        answer.upvotes.splice(index, 1);
                        return answer.save();
                    }
                }
                else {
                    let err = { status: 403, message: `You cannot vote your own answer` };
                    throw err;
                }
            }
            else {
                let err = { status: 404, message: `Answer not found` };
                next(err);
            }
        })
        .then((voted) => {
            res.status(200).json({ message: "Upvoted answer" });
        })
        .catch((err) => {
            next(err);
        });
    }

    static downvote(req, res, next) {
        Answer.findById(req.params.id)
        .then((answer) => {
            if (answer) {
                if (answer.UserId != req.user._id) {
                    if (answer.downvotes.includes(req.user._id) === false) {
                        const upvote = answer.upvotes.indexOf(req.user._id);
                        if (upvote >= 0) {
                            answer.upvotes.splice(upvote, 1);
                        }
                        answer.downvotes.push(req.user._id);
                        return answer.save();
                    } else {
                        const index = answer.downvotes.indexOf(req.user._id);
                        answer.downvotes.splice(index, 1);
                        return answer.save();
                    }
                }
                else {
                    let err = { status: 403, message: `You cannot vote your own answer` };
                    throw err;
                }
            }
            else {
                let err = { status: 404, message: `Answer not found` };
                next(err);
            }
        })
        .then((voted) => {
            res.status(200).json({ message: "Downvoted answer" })
        })
        .catch((err) => {
            next(err);
        });
    }
}

module.exports = AnswerController;
