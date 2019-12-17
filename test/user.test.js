const chai = require("chai");
const chaiHttp = require("chai-http");
// const sinon = require("sinon");
// const verification = require("../middlewares/verification");
// sinon.replace(verification, "verification", (req, res, next) => {
//     req.user = {
//         name: "Edison",
//         email: "edirates@gmail.com"
//     };
//     next();
// });
// const app = require("../app");
const { app } = require("./sinon");
const User = require("../models/user");

// Use Chai HTTP
chai.use(chaiHttp);
const expect = chai.expect;

// Declare Request Body
let userSignUp = {
    email: "arya@stark.com",
    password: "Arya1234",
    name: "Arya Stark"
};

let userSignIn = {
    email: userSignUp.email,
    password: userSignUp.password
};

let userToken = "";
let firstUserId = "";
let secondUserId = "";
let wrongUserId = "5dc93e20274f784242aedf81";

describe("Root Path Testing", function () {
    describe("Success Response", function () {
        it("Should return an object value contains message with HTTP status code 200", function (done) {
            chai.request(app)
                .get("/")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("object").to.have.any.keys("message");
                    expect(res.body.message).to.equal("Welcome to LogicWarz");
                    done();
                });
        });
    });
});
describe("User Routing Tests", function () {
    // Hooks before doing testing
    before(function (done) {
        User.create({
            email: "edirates@gmail.com",
            password: "Edison1234",
            name: "Edison"
        })
            .then((user) => {
                firstUserId = user._id;
                return User.create({
                    email: "jon@snow.com",
                    password: "Jonsnow1234",
                    name: "Jon Snow"
                });
            })
            .then((user) => {
                secondUserId = user._id;
                console.log(`Initial users created.`);
                done();
            })
            .catch((err) => {
                console.log(err);
            });
    });
    describe("POST /users/signup", function () {
        describe("Success Response", function () {
            it("Should return an object value contains token with HTTP status code 201", function (done) {
                chai.request(app)
                    .post("/users/signup")
                    .send(userSignUp)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(201);
                        expect(res.body).to.be.an("object").to.have.any.keys("user_data", "token");
                        expect(res.body.user_data).to.be.an("object").to.have.any.keys("_id", "email", "password", "name", "points");
                        done();
                    });
            });
        });
        describe("Error Responses", function () {
            it("Should return an error with HTTP status code 400 because of empty email value", function (done) {
                const emptyEmail = { ...userSignUp };
                emptyEmail.email = "";
                chai.request(app)
                    .post("/users/signup")
                    .send(emptyEmail)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Email address is required");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of invalid email format", function (done) {
                const invalidEmail = { ...userSignUp };
                invalidEmail.email = "tester.com";
                chai.request(app)
                    .post("/users/signup")
                    .send(invalidEmail)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Invalid email address format");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of duplicate email value", function (done) {
                chai.request(app)
                    .post("/users/signup")
                    .send(userSignUp)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Email address must be unique");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of empty password value", function (done) {
                const emptyPassword = { ...userSignUp };
                emptyPassword.password = "";
                chai.request(app)
                    .post("/users/signup")
                    .send(emptyPassword)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Password is required");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of password not contained one uppercase letter", function (done) {
                const upperPassword = { ...userSignUp };
                upperPassword.password = "tester1234";
                chai.request(app)
                    .post("/users/signup")
                    .send(upperPassword)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Minimum eight characters, at least one uppercase letter, one lowercase letter and one number");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of password not contained one lowercase letter", function (done) {
                const lowerPassword = { ...userSignUp };
                lowerPassword.password = "TESTER1234";
                chai.request(app)
                    .post("/users/signup")
                    .send(lowerPassword)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Minimum eight characters, at least one uppercase letter, one lowercase letter and one number");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of password not contained one number", function (done) {
                const numberPassword = { ...userSignUp };
                numberPassword.password = "TESTERtester";
                chai.request(app)
                    .post("/users/signup")
                    .send(numberPassword)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Minimum eight characters, at least one uppercase letter, one lowercase letter and one number");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of password length below 8", function (done) {
                const lessPassword = { ...userSignUp };
                lessPassword.password = lessPassword.password.slice(7);
                chai.request(app)
                    .post("/users/signup")
                    .send(lessPassword)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Minimum eight characters, at least one uppercase letter, one lowercase letter and one number");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 400 because of empty name value", function (done) {
                const emptyName = { ...userSignUp };
                emptyName.name = "";
                chai.request(app)
                    .post("/users/signup")
                    .send(emptyName)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.an("array").that.includes("Name is required");
                        done();
                    });
            });
        });
    });
    describe("POST /users/signin", function () {
        describe("Success Response", function () {
            it("Should return an object value contains token with HTTP status code 200", function (done) {
                chai.request(app)
                    .post("/users/signin")
                    .send(userSignIn)
                    .end(function (err, res) {
                        userToken = res.body.token;
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("user_data", "token");
                        expect(res.body.user_data).to.be.an("object").to.have.any.keys("_id", "email", "password", "name", "points");
                        done();
                    });
            });
        });
        describe("Error Responses", function () {
            it("Should return an error with HTTP status code 404 because of empty email value", function (done) {
                const emptyEmail = { ...userSignIn };
                emptyEmail.email = "";
                chai.request(app)
                    .post("/users/signin")
                    .send(emptyEmail)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(401);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.equal("Email address / password is incorrect");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 404 because email is not found", function (done) {
                const invalidEmail = { ...userSignIn };
                invalidEmail.email = "tester@mail.com";
                chai.request(app)
                    .post("/users/signin")
                    .send(invalidEmail)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(401);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.equal("Email address / password is incorrect");
                        done();
                    });
            });
            it("Should return an error with HTTP status code 404 because password is not match", function (done) {
                const wrongPassword = { ...userSignIn };
                wrongPassword.password = "changepass";
                chai.request(app)
                    .post("/users/signin")
                    .send(wrongPassword)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(401);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.equal("Email address / password is incorrect");
                        done();
                    });
            });
        });
    });
    describe("POST /users/gsignin", function() {
        describe("Success Response", function() {
            it("Should return an object value contains token with HTTP status code 200", function(done) {
                chai.request(app)
                .post("/users/gsignin")
                .send(userSignIn)
                .end( function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("object").to.have.any.keys("user_data","token");
                    expect(res.body.user_data).to.be.an("object").to.have.any.keys("_id","email","password","name","points");
                    done();
                });
            });
        });
    });
    describe("GET /users/all", function () {
        describe("Success Response", function () {
            it("Should return an array of object value containing all user data with HTTP status code 200", function (done) {
                chai.request(app)
                    .get("/users/all")
                    .set("token", userToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("array");
                        expect(res.body[0]).to.be.an("object").to.have.any.keys("_id", "email", "password", "name", "points");
                        done();
                    });
            });
        });
    });
    describe("GET /users", function () {
        describe("Success Response", function () {
            it("Should return an object value containing user data with HTTP status code 200", function (done) {
                chai.request(app)
                    .get("/users")
                    .set("token", userToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("_id", "email", "password", "name", "points");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .get("/users")
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
    describe("PATCH /users/:id", function () {
        describe("Success Response", function () {
            it("Should return an object value containing updated user data with HTTP status code 200", function (done) {
                chai.request(app)
                    .patch("/users/"+firstUserId)
                    .send({
                        points: 10
                    })
                    .set("token", userToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an("object").to.have.any.keys("_id", "email", "password", "name", "points");
                        done();
                    });
            });
        });
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 403 because user not logged in", function (done) {
                chai.request(app)
                    .patch("/users/"+firstUserId)
                    .send({
                        points: 10
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
        describe("Error Response", function () {
            it("Should return an error with HTTP status code 404 because user not found", function (done) {
                chai.request(app)
                    .patch("/users/"+wrongUserId)
                    .send({
                        points: 10
                    })
                    .set("token", userToken)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(404);
                        expect(res.body).to.be.an("object").to.have.any.keys("message");
                        expect(res.body.message).to.be.equal("User not found");
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
                    console.log(`All users are deleted.`);
                    done();
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    });
});