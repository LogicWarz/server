const app = require('../app')
const http = require('http')

const PORT = process.env.PORT || 3000
const server = http.Server(app)
const io = require('socket.io')(server)

io.on('connection', (socket) => {
    console.log('socket.io is now connected')

    socket.on('getRoom', (data) => {
        io.emit('getRoom', data)
    })

    socket.on('remove-room', () => {
        io.emit('remove-room')
    })

    socket.on('join-room', (data) => {
        socket.broadcast.emit('joinRoom', { id: data.id, msg: data.msg })
    })

    socket.on('play-game', (data) => {
        socket.broadcast.emit('playGame', { id: data.id, msg: data.msg })
    })

    socket.on('leave-room', (data) => {
        socket.broadcast.emit('leaveRoom', { id: data.id, msg: data.msg })
    })
})

server.listen(PORT, () => console.log(`Server is listening from port : ${PORT}`));
