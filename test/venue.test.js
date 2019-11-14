const chai = require('chai');
const chaiHttp  = require('chai-http');
const testSetup = require('../src/index');


const {assert, expect, use} = chai;
const URL_PREFIX = "/api/v1";
const {server, userModel, bcrypt, venueModel} = testSetup;

use(chaiHttp);

let venue;

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
			.then(user => {
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
});

describe("Venue Tests", () => {
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
});

after(done => {
	Promise.all([
		userModel.destroy({where: {email: "test@yahoo.com"}}),
		venueModel.destroy({where: {title: "Venue 1"}})
	])
		.then(() => {
			done();
		})
		.catch(err =>
			console.log("Auth Test - Deleting Fake user and venue failed", err)
		);
});
