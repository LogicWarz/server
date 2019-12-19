const Question = require("../models/question");
const Answer = require("../models/answer");

class QuestionController {
    static findAll (req, res, next) {
        let where = {};
        /* istanbul ignore next */
        if (req.query.tags) {
            /* istanbul ignore next */
            where = { tags: new RegExp('^'+req.query.tags+'$', "i")};
        }
        Question.find(where)
        .populate("UserId", "-password")
        .sort({
            createdAt: "DESC"
        })
        .then((questions) => {
            res.status(200).json(questions);
        })
        .catch((err) => {
            /* istanbul ignore next */
            next(err);
        });
    }

    static findUser (req, res, next) {
        Question.find({
            UserId: req.user._id
        })
        .sort({
            createdAt: "DESC"
        })
        .populate("UserId", "-password")
        .then((questions) => {
            res.status(200).json(questions);
        })
        .catch((err) => {
            /* istanbul ignore next */
            next(err);
        });
    }

    static findOne (req, res, next) {
        Question.findById(req.params.id)
        .populate({
            path: "answers",
            model: "Answer",
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
        .then((question) => {
            if (question) {
                res.status(200).json(question);
            } 
            else {
                let err = { status: 404, message: `Question not found` };
                next(err);
            }
        })
        .catch((err) => {
            /* istanbul ignore next */
            next(err);
        });
    }

    static create (req, res, next) {
        Question.create({
            title: req.body.title,
            description: req.body.description,
            tags: req.body.tags,
            UserId: req.user._id
        })
        .then((question) => {
            res.status(201).json(question);
        })
        .catch((err) => {
            next(err);
        });
    }

    static update (req, res, next) {
        Question.findByIdAndUpdate(req.params.id, 
        { $set: {
            title: req.body.title,
            description: req.body.description,
            tags: req.body.tags
        }}, { 
            omitUndefined: true, 
            runValidators:true, 
            new: true 
        })
        .populate("UserId", "-password")
        /* istanbul ignore next */
        .then((question) => {
            /* istanbul ignore next */
            if (question) {
                res.status(200).json(question);
            } 
            else {
                let err = { status: 404, message: `Question not found` };
                next(err);
            }
        })
        .catch((err) => {
            next(err);
        });
    }
    
    static delete (req, res, next) {
        /* istanbul ignore next */
        Question.findByIdAndDelete(req.params.id)
        .then((question) => {  
            if (question) {
                return Answer.deleteMany({ QuestionId: req.params.id });
            }
            else {
                let err = { status: 404, message: `Question not found` };
                next(err);
            }
        })
        .then((answer) => {
            res.status(200).json({ message: "Question deleted successfully" });
        })
        .catch((err) => {
            next(err);
        });
    }

    /* istanbul ignore next */
    static solution(req, res, next) {
        Question.findById(req.params.id)
        .then((question) => {
            if (question) {
                if (question.solution != req.body.AnswerId) {
                    question.solution = req.body.AnswerId;
                    return question.save();
                } 
                else {
                    question.solution = null;
                    return question.save();
                }
            }
            else {
                let err = { status: 404, message: `Question not found` };
                next(err);
            }
        })
        .then((updated) => {
            res.status(200).json({ message: "Solution selected" });
        })
        .catch((err) => {
            next(err);
        });
    }

    static view(req, res, next) {
        Question.findById(req.params.id)
        .then((question) => {
            if (question) {
                if (question.views.includes(req.user._id) === false) {
                    question.views.push(req.user._id);
                    return question.save();
                }
            }
            else {
                let err = { status: 404, message: `Question not found` };
                next(err);
            }
        })
        .then((viewed) => {
            res.status(200).json({ message: "Viewed question" });
        })
        .catch((err) => {
            next(err);
        });
    }

    static upvote(req, res, next) {
        Question.findById(req.params.id)
        .then((question) => {
            if (question) {
                if (question.UserId != req.user._id) {
                    if (question.upvotes.includes(req.user._id) === false) {
                        const downvote = question.downvotes.indexOf(req.user._id);
                        if (downvote >= 0) {
                            question.downvotes.splice(downvote, 1);
                        }
                        question.upvotes.push(req.user._id);
                        return question.save();
                    } else {
                        const index = question.upvotes.indexOf(req.user._id);
                        question.upvotes.splice(index, 1);
                        return question.save();
                    }
                }
                else {
                    let err = { status: 403, message: `You cannot vote your own question` };
                    next(err);
                }
            }
            else {
                let err = { status: 404, message: `Question not found` };
                next(err);
            }
        })
        .then((voted) => {
            res.status(200).json({ message: "Upvoted question" });
        })
        .catch((err) => {
            next(err);
        });
    }

    static downvote(req, res, next) {
        Question.findById(req.params.id)
        .then((question) => {
            if (question) {
                if (question.UserId != req.user._id) {
                    if (question.downvotes.includes(req.user._id) === false) {
                        const upvote = question.upvotes.indexOf(req.user._id);
                        if (upvote >= 0) {
                            question.upvotes.splice(upvote, 1);
                        }
                        question.downvotes.push(req.user._id);
                        return question.save();
                    } else {
                        const index = question.downvotes.indexOf(req.user._id);
                        question.downvotes.splice(index, 1);
                        return question.save();
                    }
                }
                else {
                    let err = { status: 403, message: `You cannot vote your own question` };
                    next(err);
                }
            }
            else {
                let err = { status: 404, message: `Question not found` };
                next(err);
            }
        })
        .then((voted) => {
            res.status(200).json({ message: "Downvoted question" });
        })
        .catch((err) => {
            next(err);
        });
    }
}

module.exports = QuestionController;
