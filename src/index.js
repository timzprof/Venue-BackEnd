import "@babel/polyfill";
import fs from "fs";
import path, {dirname} from "path";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import compression from "compression";
import logger from "morgan";
import {config} from "dotenv";
import Sequelize from "sequelize";
import initializeDatabase from "./util/db";

//Models
import UserModel from "./models/user";
import ResourceModel from "./models/resource";
import VenueModel from "./models/venue";
import BookingModel from "./models/booking";

config();
const URL_PREFIX = "/api/v1";
const PORT = process.env.PORT || 7000;

// Initialize Database
const db = initializeDatabase({Sequelize});

// Initialize Models
const userModel = UserModel({Sequelize, db});
const venueModel = VenueModel({Sequelize, db});
const resourceModel = ResourceModel({Sequelize, db, Venue: venueModel});
const bookingModel = BookingModel({Sequelize, db, User: userModel});

const app = express();

app.use(helmet());
app.use(compression());
app.use(
	logger("common", {
		stream: fs.createWriteStream(path.resolve(__dirname, "./logs/access.log"), {
			flags: "a"
		})
	})
);
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Enable CORS
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, X-Access-Token, Authorization"
	);
	res.header(
		"Access-Control-Request-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, X-Access-Token, Authorization"
	);
	next();
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
	res.status(404).json({
		error: ["Path does not exist"],
		status: 404,
		message: "This route doesn't exist for you!"
	});
	next();
});

// Connect to Database
db.sync()
	.then(() => {
		console.log("DB Connection has been established");
		app.listen(PORT);
		console.log("App Running on PORT", PORT);
	})
	.catch(err => {
		console.error("Failed To connect to Database", err);
	});

export default app;
