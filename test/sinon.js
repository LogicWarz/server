const sinon = require("sinon");
const verification = require("../middlewares/verification");
let room = require('../controllers/room')
sinon.replace(verification, "verification", (req, res, next) => {
    req.user = {
        name: "Edison",
        email: "edirates@gmail.com"
    };
    next();
});
sinon.replace(room, 'createRoom', (req, res) => {
    room = {
        "room": {
            "players": [
                "5df73bd41c9d440000b503c5"
            ],
            "status": "open",
            "_id": "5df764db696c3fd8159ab513",
            "title": "apa aja",
            "__v": 0,
            "challenge": {
                "testCase": [
                    {
                        "input": [
                            [
                                [
                                    "bad",
                                    "bAd",
                                    "bad"
                                ]
                            ]
                        ],
                        "output": "Fail!"
                    },
                    {
                        "input": [
                            [
                                [
                                    "gOOd",
                                    "bad",
                                    "BAD",
                                    "bad",
                                    "bad"
                                ]
                            ]
                        ],
                        "output": "Publish!"
                    },
                    {
                        "input": [
                            [
                                [
                                    "gOOd",
                                    "bAd",
                                    "BAD",
                                    "bad",
                                    "bad",
                                    "GOOD"
                                ]
                            ]
                        ],
                        "output": "I smell a series!"
                    }
                ],
                "_id": "5df73ec3f089123e03ac042b",
                "title": "Well Of Ideas ",
                "description": "For every good Challenge idea there seem to be quite a few bad ones!<br><br>In this Challenge you need to check the provided 2 dimensional array (x) for good ideas 'good' and bad ideas 'bad'. If there are one or two good ideas, return 'Publish!', if there are more than 2 return 'I smell a series!'. If there are no good ideas, as is often the case, return 'Fail!'.<br><br>The sub arrays may not be the same length.<br><br>The solution should be case insensitive (ie good, GOOD and gOOd all count as a good idea). All inputs may not be strings.<br><br>input:<br><br>[<br>&nbsp;&nbsp;&nbsp; ['bad', 'bAd', 'bad'],<br>&nbsp;&nbsp;&nbsp; ['bad', 'bAd', 'bad'],<br>&nbsp;&nbsp;&nbsp; ['bad', 'bAd', 'bad']<br>]<br><br><div>output: 'Fail!'</div><div><br></div><div>input:<br><br>[<br>&nbsp;&nbsp;&nbsp; ['gOOd', 'bAd', 'BAD', 'bad', 'bad', 'GOOD'],<br>&nbsp;&nbsp;&nbsp; ['bad'],<br>&nbsp;&nbsp;&nbsp; ['gOOd', 'BAD']<br>]<br><br>output: 'Publish!'</div><br>input: <br><br>[<br>&nbsp;&nbsp;&nbsp; ['gOOd', 'bAd', 'BAD', 'bad', 'bad', 'GOOD'],<br>&nbsp;&nbsp;&nbsp; ['bad'],<br>&nbsp;&nbsp;&nbsp; ['gOOd', 'BAD']<br>]<br><br>output: 'I smell a series !'",
                "skeletonCode": "// Skeleton Code\n\nfunction well (x){\n    \n}",
                "difficulty": "beginner",
                "createdAt": "2019-12-16T08:22:27.311Z",
                "updatedAt": "2019-12-16T08:22:27.311Z"
            },
            "createdAt": "2019-12-16T11:04:59.825Z",
            "level": "beginner",
            "updatedAt": "2019-12-16T11:04:59.825Z"
        }
    }
    if (!req.body.title || !req.body.level) {
        res.status(400).json({ message: 'Please input required field' })
    } else if (!req.headers.token) {
        res.status(403).json({ message: 'You must log in first' })
    } else if (req.body.title === room.room.title) {
        res.status(400).json({ message: 'Room already exists' })
    } else {
        res.status(201).json(room)
    }
})
const app = require("../app");

module.exports = {
    app,
    sinon,
    verification
}