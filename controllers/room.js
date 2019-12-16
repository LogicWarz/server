const Room = require('../models/room')
const axios = require('axios')

module.exports = {
    createRoom(req, res, next) {
        console.log(req.body)
        let idChallenge = null
        const { title, level } = req.body
        if (!title || !level) {
            throw { status: 400, message: 'Please input required field' }
        }
        axios({
            method: 'get',
            url: `http://localhost:3000/challenges/random?difficulty=${level}`,
            headers: {
                token: req.headers.token
            }
        })
            .then(({ data }) => {
                console.log(data)
                idChallenge = data._id
                return Room.findOne({ title })
            })
            .then(room => {
                if (room) {
                    throw { status: 400, message: 'Room already exists' }
                } else {
                    return Room.findOneAndUpdate({ title }, { title, level, $push: { players: req.user._id }, challenge: idChallenge }, { new: true, upsert: true }).populate('challenge')
                }
            })
            .then(room => {
                console.log(room, 'ini room baru')
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
        console.log('ini params ====', req.params.id)
        Room.findById(req.params.id)
            .then(room => {
                console.log('ini room ====', room)
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