import chai from "chai";
import chaiHttp from "chai-http";
import setup from "../index";

const {assert, expect, use} = chai;
const URL_PREFIX = "/api/v1";
const {server, userModel, bcrypt} = setup();

use(chaiHttp);

before(done => {
	server.on("DBConnected", () => {
		userModel
			.create({
				username: "Tester",
				type: "admin",
				email: "test@gmail.com",
				password: bcrypt.hashSync("tester7", 10)
			})
			.then(() => {
				done();
			})
			.catch(err =>
				console.log("Auth Test - Creating Fake user failed", err.message || err)
			);
	});
});

describe("Auth Tests", () => {
	it("Logs Admin In", done => {
		chai
			.request(server)
			.post(`${URL_PREFIX}/auth/login`)
			.send({
				email: "test@gmail.com",
				password: "tester7"
			})
			.then(res => {
				expect(res).to.have.status(200);
				assert.equal(res.body.status, "success");
				done();
			})
			.catch(err => console.log("Auth Login Test - ", err.message));
	});
});

after(done => {
	userModel
		.destroy({where: {email: "test@gmail.com"}})
		.then(() => {
			done();
		})
		.catch(err => console.log("Auth Test - Deleting Fake user failed"));
});
