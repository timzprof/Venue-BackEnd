const chai = require("chai");
const chaiHttp = require("chai-http");
const testSetup = require("../src/index");

const {assert, expect, use} = chai;
const URL_PREFIX = "/api/v1";
const {server, userModel, bcrypt} = testSetup;

use(chaiHttp);

describe("Auth Tests", () => {
	before(done => {
		server.on("DBConnected", () => {
			userModel
				.create({
					username: "Tester",
					type: "admin",
					email: "test@yahoo.com",
					phone: "09087886767",
					password: bcrypt.hashSync("tester7", 10)
				})
				.then(() => {
					done();
				})
				.catch(err =>
					console.log(
						"Auth Test - Creating Fake user failed",
						err.message || err
					)
				);
		});
	});
	it("Validation Error", done => {
		chai
			.request(server)
			.post(`${URL_PREFIX}/auth/login`)
			.send({
				email: "test@yahoo.com"
			})
			.then(res => {
				expect(res).to.have.status(422);
				assert.equal(res.body.status, "error");
				done();
			})
			.catch(err => console.log("Auth Login Test(Validation) - ", err.message));
	});
	it("User Not Found Error", done => {
		chai
			.request(server)
			.post(`${URL_PREFIX}/auth/login`)
			.send({
				email: "tester@gmail.com",
				password: "tester7"
			})
			.then(res => {
				expect(res).to.have.status(404);
				assert.equal(res.body.status, "error");
				done();
			})
			.catch(err =>
				console.log("Auth Login Test(User Not Found) - ", err.message)
			);
	});
	it("Incorrect Password Error", done => {
		chai
			.request(server)
			.post(`${URL_PREFIX}/auth/login`)
			.send({
				email: "test@yahoo.com",
				password: "yepppp"
			})
			.then(res => {
				expect(res).to.have.status(400);
				assert.equal(res.body.status, "error");
				done();
			})
			.catch(err =>
				console.log("Auth Login Test(Incorrect Password) - ", err.message)
			);
	});
	it("Logs Admin In", done => {
		chai
			.request(server)
			.post(`${URL_PREFIX}/auth/login`)
			.send({
				email: "test@yahoo.com",
				password: "tester7"
			})
			.then(res => {
				expect(res).to.have.status(200);
				assert.equal(res.body.status, "success");
				done();
			})
			.catch(err => console.log("Auth Login Test(Success) - ", err.message));
	});
	after(done => {
		userModel
			.destroy({where: {email: "test@yahoo.com"}})
			.then(() => {
				done();
			})
			.catch(err => console.log("Auth Tests - Deleting Fake user failed", err));
	});
});
