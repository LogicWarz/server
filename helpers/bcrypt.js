const bcrypt = require("bcryptjs");

function hash (password) {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
}

function compare (password, hash) {
    return bcrypt.compareSync(password, hash);
}

module.exports = {
    hash,
    compare
}