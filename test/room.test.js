const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const app = require('../app')
const Room = require('../models/room')
const User = require('../models/user')

chai.use(chaiHttp)

let newUser = {}
let secondUser = {}
let token = ''
let tokenND = ''

let userSignIn = {
    email: 'testRoom@room.com',
    password: 'Ss123456'
};

let secondUserSignIn = {
    email: 'roomtest@room.com',
    password: 'Ss123456'
}

describe('CRUD rooms', () => {
    before(function () {
        User.create({
            email: 'testRoom@room.com',
            password: 'Ss123456',
            name: 'testRoom'
        })
            .then(user => {
                newUser = user
                return User.create({
                    email: 'roomtest@room.com',
                    password: 'Ss123456',
                    name: 'roomtest'
                })
            })
            .then(user => {
                secondUser = user
                console.log('User created')
            })
            .catch(err => {
                console.log(err)
            })
    })
    describe('Login user', function () {
        describe('success', function () {
            it('Should return status 200 after successfull login', function (done) {
                chai
                    .request(app)
                    .post("/users/signin")
                    .send(userSignIn)
                    .end(function (err, res) {
                        console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(200);
                        token = res.body.token
                        done()
                    })
            })
            it('Should return status 200 after successfull login', function (done) {
                chai
                    .request(app)
                    .post("/users/signin")
                    .send(secondUserSignIn)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res).to.have.status(200);
                        tokenND = res.body.token
                        done()
                    })
            })
        })
    })
    describe('Create Room', function () {
        describe('success', function () {
            it('Should return status 201 with new room data after creating', function (done) {
                chai
                    .request(app)
                    .post(`/rooms`)
                    .set('token', token)
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
                    .set('token', token)
                    .send({
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
            it('Should return status 400 because of missing level field', function (done) {
                chai
                    .request(app)
                    .post(`/rooms`)
                    .set('token', token)
                    .send({
                        title: 'testing',
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
            it('Should return status 403 because of missing token', function (done) {
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
                        expect(res).to.have.status(403)
                        expect(res.body).to.be.an('object')
                        expect(res.body.message).to.equal('You must log in first')
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
                    .set('token', token)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body.rooms).to.be.an('array')
                        done()
                    })
            })
        })
        describe('error', function () {
            it('Should return status 403 because of missing token', function (done) {
                chai
                    .request(app)
                    .get(`/rooms`)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(403)
                        expect(res.body).to.be.an('object')
                        expect(res.body.message).to.equal('You must log in first')
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
                    .set('token', token)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(200)
                        expect(res.body.room).to.be.an('object')
                        expect(res.body.room.players).to.be.an('array')
                        done()
                    })
            })
        })
        describe('error', function () {
            it('Should return status 400 because error fetching data by id', function (done) {
                chai
                    .request(app)
                    .get(`/rooms/123456`)
                    .set('token', token)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body.message).to.equal('Invalid Object ID')
                        expect(res.body).to.have.any.keys('message')
                        done()
                    })
            })
            it('Should return status 403 because of missing token', function (done) {
                chai
                    .request(app)
                    .get(`/rooms/${id}`)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(403)
                        expect(res.body).to.be.an('object')
                        expect(res.body.message).to.equal('You must log in first')
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
                    .set('token', tokenND)
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
                    .patch(`/rooms/join/123456`)
                    .set('token', tokenND)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body.message).to.equal('Invalid Object ID')
                        expect(res.body).to.have.any.keys('message')
                        done()
                    })
            })
            it('Should return status 403 because of missing token', function (done) {
                chai
                    .request(app)
                    .get(`/rooms/join/${id}`)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(403)
                        expect(res.body).to.be.an('object')
                        expect(res.body.message).to.equal('You must log in first')
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
                    .set('token', token)
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
                    .patch(`/rooms/play/123456`)
                    .set('token', token)
                    .end(function (err, res) {
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body.message).to.equal('Invalid Object ID')
                        expect(res.body).to.have.any.keys('message')
                        done()
                    })
            })
            it('Should return status 403 because of missing token', function (done) {
                chai
                    .request(app)
                    .get(`/rooms/play/${id}`)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(403)
                        expect(res.body).to.be.an('object')
                        expect(res.body.message).to.equal('You must log in first')
                        done()
                    })
            })
            it('Should return status 403 because not room master', function (done) {
                chai
                    .request(app)
                    .patch(`/rooms/play/${id}`)
                    .set('token', tokenND)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(403)
                        expect(res.body.message).to.equal('You are not room master')
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
                    .set('token', tokenND)
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
                    .patch(`/rooms/leave/123456`)
                    .set('token', tokenND)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(400)
                        expect(res.body.message).to.equal('Invalid Object ID')
                        expect(res.body).to.have.any.keys('message')
                        done()
                    })
            })
            it('Should return status 403 because of missing token', function (done) {
                chai
                    .request(app)
                    .get(`/rooms/leave/${id}`)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(403)
                        expect(res.body).to.be.an('object')
                        expect(res.body.message).to.equal('You must log in first')
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
                    .set('token', token)
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
                    .set('token', token)
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
                    .set('token', tokenND)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(404)
                        expect(res.body.message).to.equal('Room not found')
                        expect(res.body).to.have.any.keys('message')
                        done()
                    })
            })
            it('Should return status 403 because of missing token', function (done) {
                chai
                    .request(app)
                    .delete(`/rooms/${id}`)
                    .end(function (err, res) {
                        // console.log(res.body)
                        expect(err).to.be.null
                        expect(res).to.have.status(403)
                        expect(res.body).to.be.an('object')
                        expect(res.body.message).to.equal('You must log in first')
                        done()
                    })
            })
        })
    })
    after(function (done) {
        Room.deleteMany({})
            .then(() => {
                return User.deleteMany({})
            })
            .then(() => {
                done()
                console.log('delete success')
            })
            .catch(err => {
                console.log(err)
            })
    })
})