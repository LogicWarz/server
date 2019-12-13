const router = require("express").Router();
const QuestionController = require("../controllers/question");
const authentication = require("../middlewares/authentication");
const questionAuthorization = require("../middlewares/questionAuthorization");

router.get("/", QuestionController.findAll);
router.get("/user", authentication, QuestionController.findUser);
router.get("/:id", QuestionController.findOne);

router.use(authentication);
router.post("/", QuestionController.create);
router.patch("/view/:id", QuestionController.view);
router.patch("/upvote/:id", QuestionController.upvote);
router.patch("/downvote/:id", QuestionController.downvote);
router.patch('/solution/:id', questionAuthorization, QuestionController.solution);
router.put("/:id", questionAuthorization, QuestionController.update);
router.delete("/:id", questionAuthorization, QuestionController.delete);

module.exports = router;