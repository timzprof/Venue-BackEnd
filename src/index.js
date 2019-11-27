import fs from "fs";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import compression from "compression";
import fileUpload from "express-fileupload";
import logger from "morgan";
import {config} from "dotenv";
import Sequelize from "sequelize";
import {check} from "express-validator";
import listEndpoints from "express-list-endpoints";
import initializeDatabase from "./util/db";
import validator from "./util/validator";
import cloudinaryUtility from "./util/cloudinary";
import extras from "./util/extra";
import {debugLogger, prettyStringify} from "./util/logger";

// Models
import UserModel from "./models/user";
import ResourceModel from "./models/resource";
import VenueModel from "./models/venue";
import BookingModel from "./models/booking";

// Routers
import AuthRouter from "./routes/auth";
import VenueRouter from "./routes/venue";
import BookingRouter from "./routes/booking";

extras.setupFlat();
config();
const URL_PREFIX = "/api/v1";
const PORT = process.env.PORT || 7000;

// Initialize Database
const db = initializeDatabase({Sequelize});

// Initialize Models
const userModel = UserModel({Sequelize, db});
const resourceModel = ResourceModel({Sequelize, db});
const venueModel = VenueModel({
	Sequelize,
	db,
	User: userModel,
	Resource: resourceModel
});
const bookingModel = BookingModel({
	Sequelize,
	db,
	User: userModel,
	Venue: venueModel
});

// Cloudinary Config
cloudinaryUtility.init();

const app = express();
const accessLogStream = fs.createWriteStream(
	path.resolve(__dirname, "./logs/access.log"),
	{
		flags: "a"
	}
);
app.use(helmet());
app.use(compression());
app.use(
	logger(
		':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms \n',
		{
			stream: accessLogStream
		}
	)
);
app.use(
	logger(
		':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms \n'
	)
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(
	fileUpload({
		limits: {fileSize: 5 * 1024 * 1024}
	})
);

// Enable CORS
app.use((req, res, next) => {
	debugLogger(`Request body: ${prettyStringify(req.body)}`);
	debugLogger(`Request params: ${prettyStringify(req.params)}`);
	debugLogger(`Request headers: ${prettyStringify(req.headers)}`);
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
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

app.use(async (req, res, next) => {
	try {
		const user = await userModel.findOne({where: {email: "test@gmail.com"}});
		if (!user) {
			const pass = await bcrypt.hash("testpass", 10);
			await userModel.create({
				username: "Tester",
				type: "admin",
				email: "test@gmail.com",
				phone: "08088585532",
				password: pass
			});
		}
		return next();
	} catch (err) {
		return next(err);
	}
});

app.use(
	`${URL_PREFIX}/auth`,
	AuthRouter({
		express,
		bcrypt,
		expressValidator: check,
		validator,
		userModel,
		jwt
	})
);

app.use(
	`${URL_PREFIX}/venue`,
	VenueRouter({
		express,
		venueModel,
		expressValidator: check,
		resourceModel,
		validator
	})
);

app.use(
	`${URL_PREFIX}/booking`,
	BookingRouter({
		express,
		bcrypt,
		expressValidator: check,
		validator,
		userModel,
		bookingModel,
		venueModel
	})
);

app.use(`${URL_PREFIX}/endpoints`, (req, res) =>
	res.status(200).json(listEndpoints(app))
);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	res.status(404).json({
		error: ["Path does not exist"],
		status: 404,
		message: "This route doesn't exist for you!"
	});
	next();
});

app.use((error, req, res, next) => {
	const responseObj = {
		status: "error",
		message: "Something went wrong",
		errorMessage: error.message
	};
	if (
		process.env.NODE_ENV === "development" ||
		process.env.NODE_ENV === "production"
	) {
		responseObj.errorStack = error.stack;
		responseObj.errors = error.errors || error.response || [];
	}
	const now = new Date();
	debugLogger(
		`${now}\n
		Errors:\n
		${JSON.stringify(error.errors) || JSON.stringify(error.response) || []} 
		Stack:\n 
		${error.stack}\n\n`
	);
	return res.status(error.statusCode).json(responseObj);
});

// Connect to Database
db.sync()
	.then(() => {
		debugLogger("DB Connection has been established", "venue/database");
		app.listen(PORT, null, null, () => {
			app.emit("DBConnected");
		});
		debugLogger(`App Running on PORT: ${PORT}`);
	})
	.catch(err => {
		debugLogger(`Failed To connect to Database: ${err}`, "venue/database");
	});

module.exports = {
	server: app,
	userModel,
	bookingModel,
	venueModel,
	resourceModel,
	bcrypt
};
