const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const answerSchema = new Schema({
    QuestionId: {
        type: Schema.Types.ObjectId,
        ref: "Question",
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        minlength: [3, "Minimum length is 3"]
    },
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    downvotes: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    UserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
},{
    timestamps: true
});

const Answer = model("Answer", answerSchema);

module.exports = Answer;