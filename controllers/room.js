const Room = require('../models/room')

module.exports = {
    createRoom(req, res, next) {
        const { title, level, player } = req.body
        if (!title || !level || !player) {
            throw { status: 400, message: 'Please input required field' }
        }
        Room.findOneAndUpdate({ title }, { title, level, $push: { players: player } }, { upsert: true, new: true })
            .then(room => {
                // console.log(room)
                res.status(201).json({ room })
            })
            .catch(next)
    },
    getAll(req, res, next) {
        // console.log('masukkkk')
        Room.find().sort([['createdAt', 'descending']])
            .then(rooms => {
                res.status(200).json({ rooms })
            })
            .catch(next)
    },
    getOne(req, res, next) {
        Room.findById(req.params.id)
            .then(room => {
                res.status(200).json({ room })
            })
            .catch(next)
    },
    joinRoom(req, res, next) {
        Room.findById(req.params.id)
            .then(room => {
                if (!room) {
                    throw { status: 404, message: 'Room not found' }
                } else {
                    return Room.findByIdAndUpdate(req.params.id, { $push: { players: req.body.player } }, { new: true })
                }
            })
            .then(room => {
                res.status(200).json({ room })
            })
            .catch(next)
    },
    changeStatus(req, res, next) {
        Room.findByIdAndUpdate(req.params.id, { status: 'closed' }, { new: true })
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
                    return Room.findByIdAndUpdate(req.params.id, { $pull: { players: req.body.player } }, { new: true })
                }
            })
            .then(room => {
                res.status(200).json({ room })
            })
            .catch(next)
    },
    removeRoom(req, res, next) {
        Room.findByIdAndDelete(req.params.id)
            .then(() => {
                res.status(200).json({ message: 'Delete success' })
            })
            .catch(next)
    }
}