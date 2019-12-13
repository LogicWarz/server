const router = require("express").Router();
const UserController = require("../controllers/user");
const authentication = require("../middlewares/authentication");
const { verification } = require("../middlewares/verification");

router.post("/signup", UserController.signup);
router.post("/signin", UserController.signin);
router.get('/', authentication, UserController.findOne)
router.post("/gsignin", verification, UserController.gsignin);

module.exports = router;