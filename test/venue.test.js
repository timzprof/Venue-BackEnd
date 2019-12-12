const chai = require("chai");
const chaiHttp = require("chai-http");
const { config } = require('dotenv');
const testSetup = require("../src/index");

const {assert, expect, use} = chai;
const URL_PREFIX = "/api/v1";
const {server, userModel, bcrypt, venueModel, jwt} = testSetup;

config();
use(chaiHttp);

describe("Venue Tests", () => {
	let venue;
	let token;

	before(done => {
		userModel
			.create({
				username: "Tester",
				type: "admin",
				email: "test@yahoo.com",
				phone: "09087886767",
				password: bcrypt.hashSync("tester7", 10)
			})
			.then(user => {
				token = jwt.sign(
					{
						user: {
							id: user.dataValues.id,
							name: user.dataValues.name,
							email: user.dataValues.email,
							type: user.dataValues.type
						}
					},
					process.env.JWT_SECRET,
					{
						expiresIn: "10m"
					}
				);
				return venueModel.create({
					title: "Venue 1",
					address: "Venue 1 address",
					capacity: 50,
					featureImage: "img.png",
					otherImages: ["img2.png", "img3.png"],
					timeAllowed: ["12am", "12pm"],
					adminId: user.id
				});
			})
			.then(realVenue => {
				venue = {...realVenue.dataValues};
				done();
			})
			.catch(err =>
				console.log(
					"Venue Test - Creating Fake user and venue failed",
					err.message || err
				)
			);
	});

	context("Get Venues Tests", () => {
		it("Get All Venues", done => {
			chai
				.request(server)
				.get(`${URL_PREFIX}/venue`)
				.then(res => {
					expect(res).to.have.status(200);
					assert.equal(res.body.status, "success");
					done();
				})
				.catch(err => console.log("Get Venues Test(success) - ", err.message));
		});
	});
	context("Get Single Venue Tests", () => {
		it("Venue Not Found", done => {
			chai
				.request(server)
				.get(`${URL_PREFIX}/venue/10000`)
				.then(res => {
					expect(res).to.have.status(404);
					assert.equal(res.body.status, "error");
					done();
				})
				.catch(err =>
					console.log("Get Single Venue Test(Venue Not Found) - ", err.message)
				);
		});
		it("Get Single Venue", done => {
			chai
				.request(server)
				.get(`${URL_PREFIX}/venue/${venue.id}`)
				.then(res => {
					expect(res).to.have.status(200);
					assert.equal(res.body.status, "success");
					done();
				})
				.catch(err =>
					console.log("Get Single Venue Test(Success) - ", err.message)
				);
		});
	});
	context("Add Venue Tests", () => {
		it("Not Authorized", done => {
			chai
				.request(server)
				.post(`${URL_PREFIX}/venue`)
				.then(res => {
					expect(res).to.have.status(401);
					assert.equal(res.body.status, "error");
					done();
				})
				.catch(err => console.log("Add Venue Test(Auth) - ", err.message));
		});
		it("Validation", done => {
			chai
				.request(server)
				.post(`${URL_PREFIX}/venue`)
				.set('Authorization', `Bearer ${token}`)
				.field("title", "Test Venue")
				.then(res => {
					expect(res).to.have.status(422);
					assert.equal(res.body.status, "error");
					done();
				})
				.catch(err =>
					console.log("Add Venue Test(Validation) - ", err.message)
				);
		});
		it("No Image Sent", done => {
			chai
				.request(server)
				.post(`${URL_PREFIX}/venue`)
				.set('Authorization', `Bearer ${token}`)
				.field("title", "Test Venue")
				.field("address", "Test Venue Address")
				.field("capacity", "100")
				.field(
					"resources",
					`[{"name": "internet","value": "available"},{"name": "chairs","value": "150"},{"name": "tables","value": "75"}]`
				)
				.field("timeAllowed", `["9am", "5pm"]`)
				.then(res => {
					expect(res).to.have.status(422);
					assert.equal(res.body.status, "error");
					// expect(res.body.errors).to.deep.include("Feature Image Required");
					done();
				})
				.catch(err =>
					console.log("Add Venue Test(Validation) - ", err.message)
				);
		});
		it("Create Venue", done => {
			chai
				.request(server)
				.post(`${URL_PREFIX}/venue`)
				.set('Authorization', `Bearer ${token}`)
				.field("title", "Test Venue")
				.field("address", "Test Venue Address")
				.field("capacity", "100")
				.field(
					"resources",
					`[{"name": "internet","value": "available"},{"name": "chairs","value": "150"},{"name": "tables","value": "75"}]`
				)
				.field("timeAllowed", `["9am", "5pm"]`)
				.attach("featureImage", "./test/images/test.jpg", "test.jpg")
				.attach("image1", "./test/images/test1.jpg", "test1.jpg")
				.then(res => {
					expect(res).to.have.status(201);
					assert.equal(res.body.status, "success");
					done();
				})
				.catch(err =>
					console.log("Add Venue Test(Validation) - ", err.message)
				);
		});
	});
	context("Update Venue Tests", () => {
		it("Not Authorized", done => {
			chai
				.request(server)
				.put(`${URL_PREFIX}/venue/${venue.id}`)
				.then(res => {
					expect(res).to.have.status(401);
					assert.equal(res.body.status, "error");
					done();
				})
				.catch(err => console.log("Update Venue Test(Auth) - ", err.message));
		});
		// it("Update Venue", done => {
		// 	chai
		// 		.request(server)
		// 		.put(`${URL_PREFIX}/venue/${venue.id}`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.field("address", "Test Venue 1 Address")
		// 		.field("capacity", "150")
		// 		.then(res => {
		// 			expect(res).to.have.status(200);
		// 			assert.equal(res.body.status, "success");
		// 			done();
		// 		})
		// 		.catch(err =>
		// 			console.log("Update Venue Test(success) - ", err.message)
		// 		);
		// });
	});
	context("Delete Venue Tests", () => {
		it("Not Authorized", done => {
			chai
				.request(server)
				.delete(`${URL_PREFIX}/venue/${venue.id+1}`)
				.then(res => {
					expect(res).to.have.status(401);
					assert.equal(res.body.status, "error");
					done();
				})
				.catch(err => console.log("Delete Venue Test(Auth) - ", err.message));
		});
		// it("Delete Venue", done => {
		// 	chai
		// 		.request(server)
		// 		.put(`${URL_PREFIX}/venue/${venue.id+1}`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.then(res => {
		// 			expect(res).to.have.status(200);
		// 			assert.equal(res.body.status, "success");
		// 			done();
		// 		})
		// 		.catch(err =>
		// 			console.log("Delete Venue Test(success) - ", err.message)
		// 		);
		// });
	});
	after(done => {
		Promise.all([
			userModel.destroy({where: {email: "test@yahoo.com"}}),
			venueModel.destroy({where: {title: "Venue 1"}}),
			venueModel.destroy({where: {title: 'Test Venue'}})
		])
			.then(() => {
				done();
			})
			.catch(err =>
				console.log("Venue Tests - Deleting Fake user and venue failed", err)
			);
	});
});
