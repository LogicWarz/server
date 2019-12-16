const sinon = require("sinon");
const verification = require("../middlewares/verification");
sinon.replace(verification, "verification", (req, res, next) => {
    req.user = {
        name: "Edison",
        email: "edirates@gmail.com"
    };
    next();
});
const app = require("../app");

module.exports = {
    app,
    sinon,
    verification
}