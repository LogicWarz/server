const router = require("express").Router();
const UserController = require("../controllers/user");
const authentication = require("../middlewares/authentication");
const { verification } = require("../middlewares/verification");

router.post("/signup", UserController.signup);
router.post("/signin", UserController.signin);
router.post("/gsignin", verification, UserController.gsignin);

router.use(authentication);
router.get('/all', UserController.findAll);
router.get('/', UserController.findOne);
router.patch('/:id', UserController.updatePoints);

module.exports = router;