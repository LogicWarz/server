const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const User = require("../models/user");
const Question = require("../models/question");
const Answer = require("../models/answer");

// Use Chai HTTP
chai.use(chaiHttp);
const expect = chai.expect;

// Declare Initial Variables
const firstUser = {
    email: "tyrion@lannister.com",
    password: "Tyrion1234",
    name: "Tyrion"
}
const secondUser = {
    email: "cersei@lannister.com",
    password: "Cersei1234",
    name: "Cersei"
}

// Declare Variables to Store User ID and Token
let firstUserId = "";
let firstUserToken = "";
let secondUserId = "";
let secondUserToken = "";

// Declare Variables to Store answers ID
let firstQuestionId = "";
let secondQuestionId = "";

// Request Request Body New Answer
let firstAnswerId = "";
let secondAnswerId = "";
let wrongQuestionId = "5dc93e20274f784242aedf80";
let wrongAnswerId = "5dc93e20274f784242aedf80";
let newAnswerId = "";

describe("User Sign In Tests", function () {
    // Hooks before doing testing
    before(function (done) {
        User.create(firstUser)
            .then((user) => {
                firstUserId = user._id;
                return User.create(secondUser);
            })
            .then((user) => {
                secondUserId = user._id;
                console.log(`Initial users created.`);
                return Question.create({
                    title: "First Question",
                    description: "How are you?",
                    tags: "life,greeting",
                    UserId: firstUserId
                });
            })
            .then((question) => {
                firstQuestionId = question._id;
                return Question.create({
                    title: "Second Question",
                    description: "What do you do?",
                    tags: "work,occupation",
                    UserId: secondUserId
                });
            })
            .then((question) => {
                secondQuestionId = question._id;
                console.log(`Initial answers created.`);
                return Answer.create({
                    QuestionId: firstQuestionId,
                    description: "Is there anyone there?",
                    UserId: firstUserId
                });
            })
            .then((answer) => {
                firstAnswerId = answer._id;
                return Answer.create({
                    QuestionId: secondQuestionId,
                    description: "Please answer me.",
                    UserId: secondUserId
                });
            })
            .then((answer) => {
                secondAnswerId = answer._id;
                console.log(`Initial answers created.`);
                done();
            })
            .catch((err) => {
                console.log(err);
            });
    });

    describe("First User Sign In", function () {
        it("Should return an object value contains token with HTTP status code 200", function (done) {
            chai.request(app)
                .post("/users/signin")
                .send({
                    email: firstUser.email,
                    password: firstUser.password
                })
                .end(function (err, res) {
                    firstUserToken = res.body.token;
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("object").to.have.any.keys("user_data", "token");
                    expect(res.body.user_data).to.be.an("object").to.have.any.keys("_id", "email", "password", "name", "points");
                    done();
                });
        });
    });
    describe("Second User Sign In", function () {
        it("Should return an object value contains token with HTTP status code 200", function (done) {
            chai.request(app)
                .post("/users/signin")
                .send({
                    email: secondUser.email,
                    password: secondUser.password
                })
                .end(function (err, res) {
                    secondUserToken = res.body.token;
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("object").to.have.any.keys("user_data", "token");
                    expect(res.body.user_data).to.be.an("object").to.have.any.keys("_id", "email", "password", "name", "points");
                    done();
                });
        });
    });
});

describe("Answer Routing Tests", function () {
    this.timeout(30000);
    describe("GET /answers/", function () {
        describe("Success Response", function () {
            it("Should return an array of object value containing all answers with HTTP status code 200", function (done) {
                chai.request(app)
                    .get("/answers")
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('array');
                        expect(res.body[0]).to.be.an("object").to.have.any.keys("_id", "QuestionId", "description", "upvotes", "downvotes", "UserId");
                        done();
                    });
            });
        });
    });
    describe("GET /answers/question/:id", function () {
        describe("Success Response", function () {
            it("Should return an array of object value containing all answers for one question with HTTP status code 200", function (done) {
                chai.request(app)
                    .get("/answers/question/" + firstQuestionId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('array');
                        expect(res.body[0]).to.be.an("object").to.have.any.keys("_id", "QuestionId", "description", "upvotes", "downvotes", "UserId");
                        done();
                    });
            });
        });
    });
    describe("GET /answers/user", function () {
        describe("Success Response", function () {
            it("Should return an array of object value containing all user answers with HTTP status code 200", function (done) {
                chai.request(app)
                    .get("/answers/user")
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('array');
                        expect(res.body[0]).to.be.an("object").to.have.any.keys("_id", "QuestionId", "description", "upvotes", "downvotes", "UserId");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .get("/answers/user")
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You must log in first");
                        done();
                    });
            });
        });
    });
    describe("GET /answers/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value containing one answer with HTTP status code 200", function (done) {
                chai.request(app)
                    .get("/answers/" + firstAnswerId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("_id", "QuestionId", "description", "upvotes", "downvotes", "UserId");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 404 because answer is not found", function (done) {
                chai.request(app)
                    .get("/answers/" + wrongAnswerId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Answer not found");
                        done();
                    });
            });
        });
    });
    describe("POST /answers/", function () {
        describe("Success Response", function () {
            it("Should return an object value with HTTP status code 201", function (done) {
                chai.request(app)
                    .post("/answers")
                    .send({
                        QuestionId: secondQuestionId,
                        description: "I'm a web developer.",
                    })
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        newAnswerId = res.body._id;
                        expect(err).to.be.null;
                        expect(res).to.have.status(201);
                        expect(res.body).to.be.an("object").to.have.any.keys("_id", "QuestionId", "description", "upvotes", "downvotes", "UserId");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 404 because question not found", function (done) {
                chai.request(app)
                    .post("/answers")
                    .send({
                        QuestionId: wrongQuestionId,
                        description: "I'm a web developer.",
                    })
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Question not found");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of empty description value", function (done) {
                chai.request(app)
                    .post("/answers")
                    .send({
                        QuestionId: secondQuestionId,
                        description: "",
                    })
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Description is required");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of description length below 3 characters", function (done) {
                chai.request(app)
                    .post("/answers")
                    .send({
                        QuestionId: secondQuestionId,
                        description: "it",
                    })
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Minimum length is 3");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .post("/answers")
                    .send({
                        QuestionId: secondQuestionId,
                        description: "I'm a web developer.",
                    })
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You must log in first");
                        done();
                    });
            });
        });
    });
    describe("PATCH /upvote/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/answers/upvote/" + firstAnswerId)
                    .set("token", secondUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Upvoted answer");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .patch("/answers/upvote/" + firstAnswerId)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You must log in first");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 404 because answer not found", function (done) {
                chai.request(app)
                    .patch("/answers/upvote/" + wrongAnswerId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Answer not found");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 403 because you cannot vote your own answer", function (done) {
                chai.request(app)
                    .patch("/answers/upvote/" + firstAnswerId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You cannot vote your own answer");
                        done();
                    });
            });
        });
    });
    describe("PATCH /downvote/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/answers/downvote/" + firstAnswerId)
                    .set("token", secondUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Downvoted answer");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .patch("/answers/downvote/" + firstAnswerId)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You must log in first");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 404 because answer not found", function (done) {
                chai.request(app)
                    .patch("/answers/downvote/" + wrongAnswerId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Answer not found");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 403 because you cannot vote your own answer", function (done) {
                chai.request(app)
                    .patch("/answers/downvote/" + firstAnswerId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You cannot vote your own answer");
                        done();
                    });
            });
        });
    });
    describe("PUT /answers/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .put("/answers/" + firstAnswerId)
                    .send({
                        description: "I want to change my answer."
                    })
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("_id", "QuestionId", "description", "upvotes", "downvotes", "UserId");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 400 because of empty description value", function (done) {
                chai.request(app)
                    .put("/answers/" + firstAnswerId)
                    .send({
                        description: "",
                    })
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Description is required");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of description length below 3 characters", function (done) {
                chai.request(app)
                    .put("/answers/" + firstAnswerId)
                    .send({
                        description: "it",
                    })
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Minimum length is 3");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .put("/answers/" + firstAnswerId)
                    .send({
                        description: "I'm a web developer.",
                    })
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You must log in first");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 404 because answer not found", function (done) {
                chai.request(app)
                    .put("/answers/" + wrongAnswerId)
                    .send({
                        description: "I'm a web developer.",
                    })
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Answer not found");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 403 because different user", function (done) {
                chai.request(app)
                    .put("/answers/" + firstAnswerId)
                    .send({
                        description: "I'm a web developer.",
                    })
                    .set("token", secondUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(401);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You are not authorized");
                        done();
                    });
            });
        });
    });
    describe("DELETE /answers/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .delete("/answers/" + firstAnswerId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object').to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Answer deleted successfully");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .delete("/answers/" + newAnswerId)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You must log in first");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 404 because answer not found", function (done) {
                chai.request(app)
                    .delete("/answers/" + wrongAnswerId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Answer not found");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 403 because different user", function (done) {
                chai.request(app)
                    .delete("/answers/" + secondAnswerId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(401);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You are not authorized");
                        done();
                    });
            });
        });
    });
    // Delete record after testing
    after(function (done) {
        if (process.env.NODE_ENV === "testing") {
            User.deleteMany()
                .then((deleted) => {
                    console.log(`All user records deleted.`);
                    return Question.deleteMany();
                })
                .then((deleted) => {
                    console.log(`All question records deleted.`);
                    return Answer.deleteMany();
                })
                .then((deleted) => {
                    console.log(`All answer records deleted.`);
                    done();
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    });
});