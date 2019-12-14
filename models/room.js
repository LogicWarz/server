const { Schema, model } = require('mongoose')

const roomSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Room name is required']
    },
    level: {
        type: String,
        required: [true, 'Please select challenge level']
    },
    players: {
        type: [String],
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    }
}, { timestamps: true })

const Room = model('Room', roomSchema)

module.exports = Room