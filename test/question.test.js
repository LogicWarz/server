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

// Declare Variables to Store Questions ID
let firstQuestionId = "";
let secondQuestionId = "";
let wrongQuestionId = "5dc93e20274f784242aedf80";

// Request Request Body New Question
let newQuestionId = "";
let newQuestion = {
    title: "New Question",
    description: "Is this question working?",
    tags: "hope,work,fine",
};
let firstAnswerId = "";

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
                console.log(`Initial questions created.`);
                return Answer.create({
                    QuestionId: firstQuestionId,
                    description: "I'm fine thanks",
                    UserId: secondUserId
                })
            })
            .then((answer) => {
                firstAnswerId = answer._id;
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

describe("Question Routing Tests", function () {
    this.timeout(30000);
    describe("GET /questions/", function () {
        describe("Success Response", function () {
            it("Should return an array of object value containing all questions with HTTP status code 200", function (done) {
                chai.request(app)
                    .get("/questions")
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('array');
                        expect(res.body[0]).to.be.an("object").to.have.any.keys("_id", "title", "description", "tags", "answers", "upvotes", "downvotes", "views", "UserId");
                        done();
                    });
            });
        });
    });
    describe("GET /questions/user", function () {
        describe("Success Response", function () {
            it("Should return an array of object value containing all user questions with HTTP status code 200", function (done) {
                chai.request(app)
                    .get("/questions/user")
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('array');
                        expect(res.body[0]).to.be.an("object").to.have.any.keys("_id", "title", "description", "tags", "answers", "upvotes", "downvotes", "views", "UserId");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .get("/questions/user")
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
    describe("GET /questions/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value containing one question with HTTP status code 200", function (done) {
                chai.request(app)
                    .get("/questions/" + firstQuestionId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object').to.have.any.keys("_id", "title", "description", "tags", "answers", "upvotes", "downvotes", "views", "UserId");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 404 because question is not found", function (done) {
                chai.request(app)
                    .get("/questions/" + wrongQuestionId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Question not found");
                        done();
                    });
            });
        });
    });
    describe("POST /questions/", function () {
        describe("Success Response", function () {
            it("Should return an object value with HTTP status code 201", function (done) {
                chai.request(app)
                    .post("/questions")
                    .send(newQuestion)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        newQuestionId = res.body._id;
                        expect(err).to.be.null;
                        expect(res).to.have.status(201);
                        expect(res.body).to.be.an('object').to.have.any.keys("_id", "title", "description", "tags", "answers", "upvotes", "downvotes", "views", "UserId");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 400 because of empty title value", function (done) {
                const emptyTitle = { ...newQuestion };
                emptyTitle.title = "";
                chai.request(app)
                    .post("/questions")
                    .send(emptyTitle)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Title is required");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of title length below 3 characters", function (done) {
                const lessTitle = { ...newQuestion };
                lessTitle.title = "it";
                chai.request(app)
                    .post("/questions")
                    .send(lessTitle)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Minimum length is 3");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of empty description value", function (done) {
                const emptyDescription = { ...newQuestion };
                emptyDescription.description = "";
                chai.request(app)
                    .post("/questions")
                    .send(emptyDescription)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Description is required");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .post("/questions")
                    .send(newQuestion)
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
    describe("PATCH /view/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/questions/view/" + firstQuestionId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Viewed question");
                        done();
                    });
            });
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/questions/view/" + firstQuestionId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Viewed question");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .patch("/questions/view/" + firstQuestionId)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You must log in first");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 404 because question not found", function (done) {
                chai.request(app)
                    .patch("/questions/view/" + wrongQuestionId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Question not found");
                        done();
                    });
            });
        });
    });
    describe("PATCH /upvote/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/questions/upvote/" + firstQuestionId)
                    .set("token", secondUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Upvoted question");
                        done();
                    });
            });
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/questions/upvote/" + firstQuestionId)
                    .set("token", secondUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Upvoted question");
                        done();
                    });
            });
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/questions/downvote/" + firstQuestionId)
                    .set("token", secondUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Downvoted question");
                        done();
                    });
            });
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/questions/upvote/" + firstQuestionId)
                    .set("token", secondUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Upvoted question");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .patch("/questions/upvote/" + firstQuestionId)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You must log in first");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 404 because question not found", function (done) {
                chai.request(app)
                    .patch("/questions/upvote/" + wrongQuestionId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Question not found");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 403 because you cannot vote your own question", function (done) {
                chai.request(app)
                    .patch("/questions/upvote/" + firstQuestionId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You cannot vote your own question");
                        done();
                    });
            });
        });
    });
    describe("PATCH /downvote/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/questions/downvote/" + firstQuestionId)
                    .set("token", secondUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Downvoted question");
                        done();
                    });
            });
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/questions/downvote/" + firstQuestionId)
                    .set("token", secondUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Downvoted question");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .patch("/questions/downvote/" + firstQuestionId)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You must log in first");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 404 because question not found", function (done) {
                chai.request(app)
                    .patch("/questions/downvote/" + wrongQuestionId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Question not found");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 403 because you cannot vote your own question", function (done) {
                chai.request(app)
                    .patch("/questions/downvote/" + firstQuestionId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You cannot vote your own question");
                        done();
                    });
            });
        });
    });
    describe("PATCH /solution/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/questions/solution/" + firstQuestionId)
                    .send({
                        AnswerId: firstAnswerId
                    })
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Solution selected");
                        done();
                    });
            });
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/questions/solution/" + firstQuestionId)
                    .send({
                        AnswerId: firstAnswerId
                    })
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Solution selected");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .patch("/questions/solution/" + firstQuestionId)
                    .send({
                        AnswerId: firstAnswerId
                    })
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You must log in first");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 404 because question not found", function (done) {
                chai.request(app)
                    .patch("/questions/solution/" + wrongQuestionId)
                    .send({
                        AnswerId: firstAnswerId
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
            it("Should return an error with HTTP status code 403 because different user", function (done) {
                chai.request(app)
                    .patch("/questions/solution/" + firstQuestionId)
                    .send({
                        AnswerId: firstAnswerId
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
    describe("PUT /questions/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .put("/questions/" + firstQuestionId)
                    .send(newQuestion)
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
            it("Should return an error with HTTP status code 400 because of empty title value", function (done) {
                const emptyTitle = { ...newQuestion };
                emptyTitle.title = "";
                chai.request(app)
                    .put("/questions/" + firstQuestionId)
                    .send(emptyTitle)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Title is required");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of title length below 3 characters", function (done) {
                const lessTitle = { ...newQuestion };
                lessTitle.title = "it";
                chai.request(app)
                    .put("/questions/" + firstQuestionId)
                    .send(lessTitle)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Minimum length is 3");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of empty description value", function (done) {
                const emptyDescription = { ...newQuestion };
                emptyDescription.description = "";
                chai.request(app)
                    .put("/questions/" + firstQuestionId)
                    .send(emptyDescription)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Description is required");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .put("/questions/" + firstQuestionId)
                    .send(newQuestion)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You must log in first");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 404 because question not found", function (done) {
                chai.request(app)
                    .put("/questions/" + wrongQuestionId)
                    .send(newQuestion)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Question not found");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 403 because different user", function (done) {
                chai.request(app)
                    .put("/questions/" + firstQuestionId)
                    .send(newQuestion)
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
    describe("DELETE /questions/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value with HTTP status code 200", function (done) {
                chai.request(app)
                    .delete("/questions/" + firstQuestionId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object').to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Question deleted successfully");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .delete("/questions/" + newQuestionId)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(403);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("You must log in first");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 404 because question not found", function (done) {
                chai.request(app)
                    .delete("/questions/" + wrongQuestionId)
                    .set("token", firstUserToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("Question not found");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 403 because different user", function (done) {
                chai.request(app)
                    .delete("/questions/" + secondQuestionId)
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