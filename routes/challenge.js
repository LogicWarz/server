const router = require('express').Router()
const authentication = require("../middlewares/authentication");
const adminAuthorization = require("../middlewares/adminAuthorization");
const challengeController = require('../controllers/challenge')

router.use(authentication);
router.use(adminAuthorization);
router.post('/', challengeController.create)
router.get('/', challengeController.getAll)
router.get('/:id', challengeController.getId)
router.patch('/:id', challengeController.updateId)
router.delete('/:id', challengeController.deleteId)

module.exports = router