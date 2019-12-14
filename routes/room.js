const { createRoom, getAll, getOne, joinRoom, changeStatus, leaveRoom, removeRoom } = require('../controllers/room')
const router = require('express').Router()

router.get('/', getAll)

router.get('/:id', getOne)

router.post('/', createRoom)

router.patch('/join/:id', joinRoom)

router.patch('/play/:id', changeStatus)

router.patch('/leave/:id', leaveRoom)

router.delete('/:id', removeRoom)

module.exports = router