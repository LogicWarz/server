const app = require('../app')
const http = require('http')

const PORT = process.env.PORT || 3000
const server = http.createServer(app)
const io = require('socket.io').listen(server)

io.on('connection', (socket) => {
    console.log('socket.io is now connected')
    socket.on('getRoom', (data) => {
	let id = ''
	if(data){
		id = data._id
	}else {
		id = data
	}
        // console.log('000000000000', data._id)
        socket.join(id)
        io.emit('getRoom', data)
    })

    socket.on('remove-room', () => {
        console.log('test remove masuk')
        io.emit('remove-room')
        // io.emit('refetchRoom')
    })
    socket.on('join-room', (data) => {
        console.log('000000000000', data.id)
        socket.join(data.id)
        io.to(data.id).emit('joinRoom', { id: data.id, msg: data.msg })
    })

    socket.on('play-game', (data) => {
        socket.to(data.id).broadcast.emit('playGame', { id: data.id, msg: data.msg })
    })

    socket.on('leave-room', (data) => {
        socket.leave(data.id)
        socket.to(data.id).broadcast.emit('leaveRoom', { id: data.id, msg: data.msg })
    })

    socket.on('in-game', () => {
        socket.broadcast.emit('inGame', 'In game')
    })

    socket.on('success-challenge', ({ id, room }) => {
        io.to(room).emit('successChallenge', { id })
    })

    socket.on('winner-page', () => {
        socket.emit('pageWinner')
    })

    socket.on('room-gone', ({ id }) => {
        socket.leave(id)
        socket.broadcast.emit('roomGone')
    })

    socket.on('room-closed', () => {
        io.emit('closing')
    })

    socket.on('wadidaw', function ({ winner, room }) {
        // console.log('testetst', winner)
        // console.log('rommmm', room)
        io.to(room).emit('sendWinner', winner)
    })
})

server.listen(PORT, () => console.log(`Server is listening from port : ${PORT}`));
