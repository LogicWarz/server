const bcrypt = require("../helpers/bcrypt");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const userSchema = new Schema ({
    email: {
        type: String,
        required: [true, `Email address is required`],
        match: [/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, `Invalid email address format`],
        validate: {
            validator: function (v) {
                return User.findOne({
                    email: v
                })
                .then((found) => {
                    if (found)  return false;
                    else    return true;
                });
            },
            message: `Email address must be unique`
        }
    },
    password: {
        type: String,
        required: [true, `Password is required`],
        match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, `Minimum eight characters, at least one uppercase letter, one lowercase letter and one number`]
    },
    name: {
        type: String,
        required: [true, `Name is required`]
    },
    points: {
        type: Number,
        default: 0
    },
    admin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

userSchema.pre("save", function (next) {
    this.password = bcrypt.hash(this.password);
    next();
});

const User = model("User", userSchema);

module.exports = User;