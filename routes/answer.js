const router = require("express").Router();
const AnswerController = require("../controllers/answer");
const authentication = require("../middlewares/authentication");
const AnswerAuthorization = require("../middlewares/answerAuthorization");

router.get("/", AnswerController.findAll);
router.get("/question/:id", AnswerController.findQuestion);
router.get("/user", authentication, AnswerController.findUser);
router.get("/:id", AnswerController.findOne);

router.use(authentication);
router.post("/", AnswerController.create);
router.patch("/upvote/:id", AnswerController.upvote);
router.patch("/downvote/:id", AnswerController.downvote);
router.put("/:id", AnswerAuthorization, AnswerController.update);
router.delete("/:id", AnswerAuthorization, AnswerController.delete);

module.exports = router;