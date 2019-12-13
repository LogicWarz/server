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
        // match: [/(?=.*[A-Z])/, `Password must contain at least one uppercase letter`],
        // match: [/(?=.*[a-z])/, `Password must contain at least one lowercase letter`],
        // match: [/(?=.*\d)/, `Password must contain at least one number`],
        // match: [/[-+_!@#$%^&*.,?]/, `Password must contain at least special character`],
        minlength: [8, `Password length at least 8 characters`]
    },
    name: {
        type: String,
        required: [true, `Name is required`]
    },
    points: {
        type: Number,
        default: 0
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