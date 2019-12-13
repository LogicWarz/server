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
            next(err);
        });
    }

    static create (req, res, next) {
        let created = "";
        Answer.create({
            QuestionId: req.body.QuestionId,
            description: req.body.description,
            UserId: req.user._id
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
        .then((answer) => {
            return Question.findByIdAndUpdate(answer.QuestionId, { $pull: { answers: answer._id } });
        })
        .then((deleted) => {
            res.status(200).json({ message: "Answer deleted successfully" });
        })
        .catch((err) => {
            next(err);
        });
    }

    static upvote(req, res, next) {
        Answer.findById(req.params.id)
        .then((answer) => {
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
                let err = { status: 400, message: `You cannot vote your own answer` };
                throw err;
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
                let err = { status: 400, message: `You cannot vote your own answer` };
                throw err;
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
