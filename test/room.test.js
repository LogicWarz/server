const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const app = require('../app')
const Room = require('../models/room')

chai.use(chaiHttp)

let id = ''

before(function () {
    Room.findOneAndUpdate({ title: 'abc' }, { title: 'abc', level: 'beginner', $push: { players: 'testing' } }, { new: true, upsert: true })
        .then(room => {
            id = room._id
            console.log('dummy room created')
        })
        .catch(err => {
            console.log(err)
        })
})

after(function (done) {
    Room.deleteMany({})
        .then(() => {
            done()
            console.log('delete success')
        })
        .catch(err => {
            console.log(err)
        })
})

describe('CRUD rooms', () => {
    describe('Create Room', function () {
        describe('success', function () {
            it('Should return status 201 with new room data after creating', function (done) {
                chai
                    .request(app)
                    .post(`/rooms`)
                    .send({
                        title: 'testing',
                        level: 'Expert',
                        player: 'testaja'
                    })
                    .end(function (err, res) {
                        id = res.body.room._id
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(201)
                        expect(res.body.room.status).to.equal('open')
                        expect(res.body.room).to.be.an('object')
                        done()
                    })
            })
        })
        describe('error', function () {
            it('Should return status 400 because of missing title field', function (done) {
                chai
                    .request(app)
                    .post(`/rooms`)
                    .send({
                        level: 'Expert',
                        player: 'testaja'
                    })
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body).to.be.an('object')
                        expect(res.body.message).to.equal('Please input required field')
                        done()
                    })
            })
            it('Should return status 400 because of missing level field', function (done) {
                chai
                    .request(app)
                    .post(`/rooms`)
                    .send({
                        title: 'testing',
                        player: 'testaja'
                    })
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body).to.be.an('object')
                        expect(res.body.message).to.equal('Please input required field')
                        done()
                    })
            })
            it('Should return status 400 because of missing player field', function (done) {
                chai
                    .request(app)
                    .post(`/rooms`)
                    .send({
                        title: 'testing',
                        level: 'Expert',
                    })
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body).to.be.an('object')
                        expect(res.body.message).to.equal('Please input required field')
                        done()
                    })
            })
        })
    })
    describe('Fetching all rooms', function () {
        describe('success', function () {
            it('Should return status 200 with rooms data after fetching rooms', function (done) {
                chai
                    .request(app)
                    .get('/rooms')
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body.rooms).to.be.an('array')
                        done()
                    })
            })
        })
    })
    describe('Fetching room by id', function () {
        describe('success', function () {
            it('Should return status 200 with room data after fetching room id', function (done) {
                chai
                    .request(app)
                    .get(`/rooms/${id}`)
                    .end(function (err, res) {
                        console.log(res.body)
                        expect(err).to.be.null
                        // expect(res).to.have.status(200)
                        // expect(res.body.room).to.be.an('object')
                        // expect(res.body.room.players).to.be.an('array')
                        done()
                    })
            })
        })
        describe('error', function () {
            it('Should return status 400 because error fetching data by id', function (done) {
                chai
                    .request(app)
                    .get(`/rooms/123456`)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body.message).to.equal('Invalid Object ID')
                        expect(res.body).to.have.any.keys('message')
                        done()
                    })
            })
        })
    })
    describe('Join room', function () {
        describe('success', function () {
            it('Should return status 200 after joining room', function (done) {
                chai
                    .request(app)
                    .patch(`/rooms/join/${id}`)
                    .send({
                        player: 'halo'
                    })
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body.room.players).to.have.length(2)
                        done()
                    })
            })
        })
        describe('error', function () {
            it('Should return status 400 because cast path _id failed', function (done) {
                chai
                    .request(app)
                    .delete(`/rooms/123456`)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body.message).to.equal('Invalid Object ID')
                        expect(res.body).to.have.any.keys('message')
                        done()
                    })
            })
        })
    })
    describe('Play Game', function () {
        describe('success', function () {
            it('Should return status 200 after joining room', function (done) {
                chai
                    .request(app)
                    .patch(`/rooms/play/${id}`)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body.room.status).to.equal('closed')
                        done()
                    })
            })
        })
        describe('error', function () {
            it('Should return status 400 because cast path _id failed', function (done) {
                chai
                    .request(app)
                    .delete(`/rooms/123456`)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body.message).to.equal('Invalid Object ID')
                        expect(res.body).to.have.any.keys('message')
                        done()
                    })
            })
        })
    })
    describe('Leave room', function () {
        describe('success', function () {
            it('Should return status 200 after leaving room', function (done) {
                chai
                    .request(app)
                    .patch(`/rooms/leave/${id}`)
                    .send({
                        player: 'halo'
                    })
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body.room.players).to.have.length(1)
                        done()
                    })
            })
        })
        describe('error', function () {
            it('Should return status 400 because cast path _id failed', function (done) {
                chai
                    .request(app)
                    .delete(`/rooms/123456`)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body.message).to.equal('Invalid Object ID')
                        expect(res.body).to.have.any.keys('message')
                        done()
                    })
            })
        })
    })
    describe('Delete room', function () {
        describe('success', function () {
            it('Should return status 200 after deleting room', function (done) {
                chai
                    .request(app)
                    .delete(`/rooms/${id}`)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body).to.be.an('object').to.have.any.keys('message')
                        expect(res.body.message).to.equal('Delete success')
                        done()
                    })
            })
        })
        describe('error', function () {
            it('Should return status 400 because cast path _id failed', function (done) {
                chai
                    .request(app)
                    .delete(`/rooms/123456`)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body.message).to.equal('Invalid Object ID')
                        expect(res.body).to.have.any.keys('message')
                        done()
                    })
            })
            it('Should return status 404 because room not found', function (done) {
                chai
                    .request(app)
                    .patch(`/rooms/join/${id}`)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(404)
                        expect(res.body.message).to.equal('Room not found')
                        expect(res.body).to.have.any.keys('message')
                        done()
                    })
            })
        })
    })
})