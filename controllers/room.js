const Room = require('../models/room')

module.exports = {
    createRoom(req, res, next) {
        const { title, level } = req.body
        if (!title || !level) {
            throw { status: 400, message: 'Please input required field' }
        }
        Room.findOneAndUpdate({ title }, { title, level, $push: { players: req.user._id } }, { upsert: true, new: true })
            .then(room => {
                res.status(201).json({ room })
            })
            .catch(next)
    },
    getAll(req, res, next) {
        Room.find().sort([['createdAt', 'descending']]).populate({ path: 'players', options: { limit: 1 } })
            .then(rooms => {
                res.status(200).json({ rooms })
            })
            .catch(next)
    },
    getOne(req, res, next) {
        Room.findById(req.params.id).populate('players')
            .then(room => {
                res.status(200).json({ room })
            })
            .catch(next)
    },
    joinRoom(req, res, next) {
        let notUnique = false
        Room.findById(req.params.id)
            .then(room => {
                if (!room) {
                    throw { status: 404, message: 'Room not found' }
                } else {
                    room.players.forEach(player => {
                        if (player == req.user._id) {
                            notUnique = true
                        }
                    })
                    if (notUnique) throw { status: 400, message: 'You already joined the room' }
                    else return Room.findByIdAndUpdate(req.params.id, { $push: { players: req.user._id } }, { new: true }).populate('players')
                }
            })
            .then(room => {
                res.status(200).json({ room })
            })
            .catch(next)
    },
    changeStatus(req, res, next) {
        Room.findById(req.params.id)
            .then(room => {
                if (!room) throw { status: 404, message: 'Room not found' }
                else {
                    if (req.user._id == room.players[0]) {
                        return Room.findByIdAndUpdate(req.params.id, { status: 'closed' }, { new: true })
                    } else {
                        throw { status: 403, message: 'You are not room master' }
                    }
                }
            })
            .then(room => {
                res.status(200).json({ room })
            })
            .catch(next)
    },
    leaveRoom(req, res, next) {
        Room.findById(req.params.id)
            .then(room => {
                if (!room) {
                    throw { status: 404, message: 'Room not found' }
                } else {
                    return Room.findByIdAndUpdate(req.params.id, { $pull: { players: req.user._id } }, { new: true })
                }
            })
            .then(room => {
                res.status(200).json({ room })
            })
            .catch(next)
    },
    removeRoom(req, res, next) {
        Room.findById(req.params.id)
            .then(room => {
                if (!room) throw { status: 404, message: 'Room not found' }
                else {
                    if (room.players[0] == req.user._id) {
                        return Room.findByIdAndDelete(req.params.id)
                    } else {
                        throw { status: 403, message: 'You are not room master' }
                    }
                }
            })
            .then(() => {
                res.status(200).json({ message: 'Delete success' })
            })
            .catch(next)
    },
    roomFull(req, res, next) {
        Room.findById(req.params.id)
            .then(room => {
                if (!room) throw { status: 404, message: 'Room not found' }
                else {
                    return Room.findByIdAndUpdate(req.params.id, { status: 'closed' }, { new: true })
                }
            })
            .then(room => {
                res.status(200).json({ room })
            })
            .catch(next)
    }
}