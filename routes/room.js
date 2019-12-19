const { createRoom, getAll, getOne, joinRoom, successChallenge, changeStatus, leaveRoom, removeRoom, roomFull } = require('../controllers/room')
const router = require('express').Router()
const authenticate = require('../middlewares/authentication')

router.use(authenticate)

router.get('/', getAll)

router.get('/:id', getOne)

router.post('/', createRoom)

router.patch('/join/:id', joinRoom)

router.patch('/play/:id', changeStatus)

router.patch('/leave/:id', leaveRoom)

router.patch('/full/:id', roomFull)

router.delete('/:id', removeRoom)

router.delete('/success/:id', successChallenge)

module.exports = router