const chai = require("chai")
const chaiHttp = require("chai-http")
const app = require("../app")

const User = require('../models/user')
const Challenge = require('../models/challenge')

const expect = chai.expect
chai.use(chaiHttp)

describe("Testing: Challenge", function () {
  this.timeout(10000)
  let admin = {
    name: 'admin',
    email: 'admin@mail.com',
    password: 'Admin1234',
    admin: true
  }
  let player = {
    name: 'player',
    email: 'player@mail.com',
    password: 'Player1234'
  }
  let adminToken = ''
  let playerToken = ''
  before(function (done) {
    User
      .create(admin)
      .then(result => {
        return chai
          .request(app)
          .post('/users/signin')
          .send({
            email: admin.email,
            password: admin.password
          })
      })
      .then(({ body }) => {
        adminToken = body.token
        return chai
          .request(app)
          .post('/users/signup')
          .send(player)
      })
      .then(({ body }) => {
        playerToken = body.token
        done()
      })
      .catch(console.log)
  })
  after(function (done) {
    User
      .deleteMany({})
      .then(_ => done())
      .catch(console.log)
  })
  describe('POST /challenges', function () {
    let newChallenge = {
      "title": "Test",
      "description": "test",
      "testCase": [
        {
          "input": {
            "a": 1,
            "b": 2
          },
          "output": 3
        },
        {
          "input": {
            "a": 2,
            "b": 2
          },
          "output": 4
        }
      ],
      "difficulty": "easy"
    }
    describe('Success Response', function () {
      afterEach(function (done) {
        Challenge
          .deleteMany({})
          .then(_ => done())
          .catch(console.log)
      })
      it("should return created challenge", function (done) {
        chai
          .request(app)
          .post('/challenges')
          .set('token', adminToken)
          .send(newChallenge)
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(201)
            expect(res.body)
              .to.be.an("object")
              .to.have.all.keys(
                "_id",
                "title",
                "description",
                "difficulty",
                "testCase",
                "createdAt",
                "updatedAt"
              );
            expect(res.body.title)
              .to.be.a("string")
              .to.equal(newChallenge.title);
            expect(res.body.description)
              .to.be.a("string")
              .to.equal(newChallenge.description);
            expect(res.body.difficulty)
              .to.be.a("string")
              .to.equal(newChallenge.difficulty);
            expect(res.body.testCase)
              .to.be.an("array")
            done()
          })
      })
    })
    describe("Error Response", function () {
      afterEach(function (done) {
        Challenge
          .deleteMany({})
          .then(_ => done())
          .catch(console.log)
      })
      it("should send an error with 403 status code because no user login", function (done) {
        chai
          .request(app)
          .post("/challenges")
          .send(newChallenge)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.a("string")
              .to.equal('You must log in first');
            done();
          });
      });
      it('should send an error with 403 status code because user not admin', function (done) {
        chai
          .request(app)
          .post("/challenges")
          .set("token", playerToken)
          .send(newChallenge)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.a("string")
              .to.equal('You are not admin');
            done();
          });
      });
      it('should return "Title is required" with status code 400 when submit form without title', function (done) {
        const withoutTitle = { ...newChallenge }
        delete withoutTitle.title
        chai
          .request(app)
          .post("/challenges")
          .set("token", adminToken)
          .send(withoutTitle)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.an("array")
              .that.includes("Title is required");
            done();
          });
      });
      it('should return "Description is required" with status code 400 when submit form without description', function (done) {
        const withoutDescription = { ...newChallenge }
        delete withoutDescription.description
        chai
          .request(app)
          .post("/challenges")
          .set("token", adminToken)
          .send(withoutDescription)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.an("array")
              .that.includes("Description is required");
            done();
          });
      });
      it('should return "Difficulty key is required" with status code 400 when submit form without difficulty', function (done) {
        const withoutDifficulty = { ...newChallenge }
        delete withoutDifficulty.difficulty
        chai
          .request(app)
          .post("/challenges")
          .set("token", adminToken)
          .send(withoutDifficulty)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.an("array")
              .that.includes("Difficulty is required");
            done();
          });
      });
    })
  })
  describe('GET /challenges', function () {
    before(function (done) {
      let challenges = [
        {
          "title": "Test1",
          "description": "test1",
          "testCase": [
            {
              "input": {
                "a": 1,
                "b": 2
              },
              "output": 3
            }
          ],
          "difficulty": "easy"
        },
        {
          "title": "Test2",
          "description": "test2",
          "testCase": [
            {
              "input": {
                "a": 1,
                "b": 2
              },
              "output": 3
            }
          ],
          "difficulty": "medium"
        },
        {
          "title": "Test3",
          "description": "test3",
          "testCase": [
            {
              "input": {
                "a": 1,
                "b": 2
              },
              "output": 3
            }
          ],
          "difficulty": "hard"
        }
      ]
      Challenge
        .insertMany(challenges)
        .then(_ => done())
        .catch(console.log)
    })
    after(function (done) {
      Challenge
        .deleteMany({})
        .then(_ => done())
        .catch(console.log)
    })
    describe('Success Response', function () {
      it('should return list of challenges', function (done) {
        chai
          .request(app)
          .get("/challenges")
          .set('token', playerToken)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body)
              .to.be.an("array")
              .to.have.lengthOf(3);
            expect(res.body[0])
              .to.be.an("object")
              .to.have.all.keys(
                "_id",
                "title",
                "description",
                "testCase",
                "difficulty",
                "createdAt",
                "updatedAt"
              );
            done();
          });
      })
    })
    describe('Error Response', function () {
      it("should send an error with 403 status code because no user login", function (done) {
        chai
          .request(app)
          .get("/challenges")
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.a("string")
              .to.equal('You must log in first');
            done();
          });
      });
    })
  })
  describe('GET /challenges/:id', function () {
    let challengeId = ''
    let newChallenge = {
      "title": "Test",
      "description": "test",
      "testCase": [
        {
          "input": {
            "a": 1,
            "b": 2
          },
          "output": 3
        },
      ],
      "difficulty": "easy"
    }
    before(function (done) {
      Challenge
        .create(newChallenge)
        .then(result => {
          challengeId = result._id
          done()
        })
        .catch(console.log)
    })
    after(function (done) {
      Challenge
        .deleteMany({})
        .then(_ => done())
        .catch(console.log)
    })
    describe('Success Response', function () {
      it('Should return challengeId', function (done) {
        chai
          .request(app)
          .get(`/challenges/${challengeId}`)
          .set('token', playerToken)
          .end(function (err, res) {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res.body)
              .to.be.an("object")
              .to.have.all.keys(
                "_id",
                "title",
                "description",
                "testCase",
                "difficulty",
                "createdAt",
                "updatedAt"
              );
            done()
          })
      })
    })
    describe('Error Response', function () {
      it("should send an error with 403 status code because no user login", function (done) {
        chai
          .request(app)
          .get(`/challenges/${challengeId}`)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.a("string")
              .to.equal('You must log in first');
            done();
          });
      });
    })
  })
  describe('PATCH /challenges/:id', function () {
    let challengeId = ''
    let challenge = {
      "title": "Test",
      "description": "test",
      "testCase": [
        {
          "input": {
            "a": 1,
            "b": 2
          },
          "output": 3
        },
      ],
      "difficulty": "easy"
    }
    let newChallenge = {
      "title": "NewTest",
      "description": "newTest",
      "testCase": [
        {
          "input": {
            "a": 2,
            "b": 2
          },
          "output": 4
        },
      ],
      "difficulty": "medium"
    }
    before(function (done) {
      Challenge
        .create(challenge)
        .then(result => {
          challengeId = result._id
          done()
        })
        .catch(console.log)
    })
    after(function (done) {
      Challenge
        .deleteMany({})
        .then(_ => done())
        .catch(console.log)
    })
    describe('Success Response', function () {
      it("should return updated challenge", function (done) {
        chai
          .request(app)
          .patch(`/challenges/${challengeId}`)
          .set('token', adminToken)
          .send(newChallenge)
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res.body)
              .to.be.an("object")
              .to.have.all.keys(
                "_id",
                "title",
                "description",
                "difficulty",
                "testCase",
                "createdAt",
                "updatedAt"
              );
            expect(res.body.title)
              .to.be.a("string")
              .to.equal(newChallenge.title);
            expect(res.body.description)
              .to.be.a("string")
              .to.equal(newChallenge.description);
            expect(res.body.difficulty)
              .to.be.a("string")
              .to.equal(newChallenge.difficulty);
            expect(res.body.testCase)
              .to.be.an("array")
            done()
          })
      })
    })
    describe('Error Response', function () {
      it("should send an error with 403 status code because no user login", function (done) {
        chai
          .request(app)
          .patch(`/challenges/${challengeId}`)
          .send(newChallenge)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.a("string")
              .to.equal('You must log in first');
            done();
          });
      });
      it('should send an error with 403 status code because user not admin', function (done) {
        chai
          .request(app)
          .patch(`/challenges/${challengeId}`)
          .set("token", playerToken)
          .send(newChallenge)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.a("string")
              .to.equal('You are not admin');
            done();
          });
      });
      it('should return "Title is required" with status code 400 when submit form without title', function (done) {
        const withoutTitle = { ...newChallenge }
        delete withoutTitle.title
        chai
          .request(app)
          .patch(`/challenges/${challengeId}`)
          .set("token", adminToken)
          .send(withoutTitle)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.an("array")
              .that.includes("Title is required");
            done();
          });
      });
      it('should return "Description is required" with status code 400 when submit form without description', function (done) {
        const withoutDescription = { ...newChallenge }
        delete withoutDescription.description
        chai
          .request(app)
          .patch(`/challenges/${challengeId}`)
          .set("token", adminToken)
          .send(withoutDescription)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.an("array")
              .that.includes("Description is required");
            done();
          });
      });
      it('should return "Difficulty key is required" with status code 400 when submit form without difficulty', function (done) {
        const withoutDifficulty = { ...newChallenge }
        delete withoutDifficulty.difficulty
        chai
          .request(app)
          .patch(`/challenges/${challengeId}`)
          .set("token", adminToken)
          .send(withoutDifficulty)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.an("array")
              .that.includes("Difficulty is required");
            done();
          });
      });
    })
  })
  describe('DELETE /challenges/:id', function () {
    let challengeId = ''
    let newChallenge = {
      "title": "Test",
      "description": "test",
      "testCase": [
        {
          "input": {
            "a": 1,
            "b": 2
          },
          "output": 3
        },
      ],
      "difficulty": "easy"
    }
    before(function (done) {
      Challenge
        .create(newChallenge)
        .then(result => {
          challengeId = result._id
          done()
        })
        .catch(console.log)
    })
    after(function (done) {
      Challenge
        .deleteMany({})
        .then(_ => done())
        .catch(console.log)
    })
    describe('Success Response', function () {
      it('Should return challengeId', function (done) {
        chai
          .request(app)
          .delete(`/challenges/${challengeId}`)
          .set('token', adminToken)
          .end(function (err, res) {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res.body)
              .to.be.an("object")
              .to.have.all.keys(
                "_id",
                "title",
                "description",
                "testCase",
                "difficulty",
                "createdAt",
                "updatedAt"
              );
            done()
          })
      })
    })
    describe('Error Response', function () {
      it("should send an error with 403 status code because no user login", function (done) {
        chai
          .request(app)
          .delete(`/challenges/${challengeId}`)
          .send(newChallenge)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(403);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.a("string")
              .to.equal('You must log in first');
            done();
          });
      });
      it('should send an error with 403 status code because user not admin', function (done) {
        chai
          .request(app)
          .delete(`/challenges/${challengeId}`)
          .set("token", playerToken)
          .send(newChallenge)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.body)
              .to.be.an("object")
              .to.have.any.keys("message");
            expect(res.body.message)
              .to.be.a("string")
              .to.equal('You are not admin');
            done();
          });
      });
    })
  })
})