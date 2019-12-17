const Room = require('../models/room')
const axios = require('axios')

module.exports = {
    createRoom(req, res, next) {
        /* istanbul ignore next */
        let idChallenge = null
        /* istanbul ignore next */
        const { title, level } = req.body
        /* istanbul ignore next */
        if (!title || !level) {
            /* istanbul ignore next */
            throw { status: 400, message: 'Please input required field' }
        }
        /* istanbul ignore next */
        axios({
            method: 'get',
            url: `http://coderoyale.server.edirates.xyz/challenges/random?difficulty=${level}`,
            headers: {
                token: req.headers.token
            }
        })
            .then(({ data }) => {
                // console.log('0-0-0-', data)
                idChallenge = data._id
                /* istanbul ignore next */
                return Room.findOne({ title })
            })
            .then(room => {
                if (room) {
                    /* istanbul ignore next */
                    throw { status: 400, message: 'Room already exists' }
                } else {
                    /* istanbul ignore next */
                    return Room.findOneAndUpdate({ title }, { title, level, $push: { players: req.user._id }, challenge: idChallenge }, { new: true, upsert: true }).populate('challenge')
                }
            })
            .then(room => {
                /* istanbul ignore next */
                // console.log(room, 'ini room baru')
                res.status(201).json({ room })
            })
            /* istanbul ignore next */
            .catch(next)
    },
    getAll(req, res, next) {
        Room.find({ status: { $ne: 'closed' } }).sort([['createdAt', 'descending']]).populate({ path: 'players', options: { limit: 1 } })
            .then(rooms => {
                res.status(200).json({ rooms })
            })
            .catch(next)
    },
    getOne(req, res, next) {
        Room.findById(req.params.id).populate('players').populate('challenge')
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
        let roomTemp = null
        Room.findById(req.params.id)
            .then(room => {
                if (!room) {
                    throw { status: 404, message: 'Room not found' }
                } else {
                    return Room.findByIdAndUpdate(req.params.id, { $pull: { players: req.user._id } }, { new: true })
                }
            })
            .then(room => {
                roomTemp = room
                if (room.players.length == 0) {
                    return Room.findByIdAndDelete(req.params.id)
                } else {
                    return res.status(200).json({ room })
                }
            })
            .then(() => {
                res.status(200).json({ room: roomTemp })
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
    },
    successChallenge(req, res, next) {
        // console.log('ini params ====', req.params.id)
        Room.findById(req.params.id)
            .then(room => {
                // console.log('ini room ====', room)
                if (!room) throw { status: 404, message: 'Room not found' }
                else {
                    return Room.findByIdAndDelete(req.params.id)
                }
            })
            .then(() => {
                res.status(200).json({ message: 'Delete success' })
            })
            .catch(next)
    }
}