const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const questionSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        minlength: [3, "Minimum length is 3"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    downvotes: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    answers: [{
        type: Schema.Types.ObjectId,
        ref: "Answer",
    }],
    solution: {
        type: Schema.Types.ObjectId,
        ref: "Answer",
    },
    tags: {
        type: Array,
        default: []
    },
    views: [{
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

const Question = model("Question", questionSchema);

module.exports = Question;