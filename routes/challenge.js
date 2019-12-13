const router = require('express').Router()
const authentication = require("../middlewares/authentication");
const challengeController = require('../controllers/challenge')

router.use(authentication);
router.post('/', challengeController.create)
router.get('/', challengeController.getAll)
router.get('/:id', challengeController.getId)
router.delete('/:id', challengeController.deleteId)

module.exports = router