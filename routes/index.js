const router = require("express").Router();
const RoomRouter = require('./room')

router.get("/", (req, res) => {
    res.status(200).json({ message: `Welcome to LogicWarz` });
});

router.use('/rooms', RoomRouter)

module.exports = router;