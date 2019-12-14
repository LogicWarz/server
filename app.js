if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "testing") {
    require("dotenv").config();
}
require("./config/connection");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", routes);
app.use(errorHandler);

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

module.exports = app;
