import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import compression from 'compression';
import logger from 'morgan';
import { config } from 'dotenv';
import Sequelize from 'sequelize';
import { body } from 'express-validator';
import listEndpoints from 'express-list-endpoints';
import initializeDatabase from './util/db';
import validator from './util/validator';

// Models
import UserModel from './models/user';
import ResourceModel from './models/resource';
import VenueModel from './models/venue';
import BookingModel from './models/booking';

// Routers
import AuthRouter from './routes/auth';
import VenueRouter from './routes/venue';

config();
const URL_PREFIX = '/api/v1';
const PORT = process.env.PORT || 700;

// Initialize Database
const db = initializeDatabase({ Sequelize });

// Initialize Models
const userModel = UserModel({ Sequelize, db });
const venueModel = VenueModel({ Sequelize, db, User: userModel });
const resourceModel = ResourceModel({ Sequelize, db, Venue: venueModel });
const bookingModel = BookingModel({ Sequelize, db, User: userModel });

const app = express();

app.use(helmet());
app.use(compression());
// app.use(
//   logger('common', {
//     stream: fs.createWriteStream(path.resolve(__dirname, './logs/access.log'), {
//       flags: 'a',
//     }),
//   }),
// );
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, X-Access-Token, Authorization',
  );
  res.header(
    'Access-Control-Request-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, X-Access-Token, Authorization',
  );
  next();
});

app.use(async (req, res, next) => {
  const user = await userModel.findOne({ where: { email: 'test@gmail.com' } });
  if (!user) {
    const pass = await bcrypt.hash('testpass', 10);
    await userModel.create({
      username: 'Tester',
      type: 'admin',
      email: 'test@gmail.com',
      password: pass,
    });
  }
  next();
});

app.use(
  `${URL_PREFIX}/auth`,
  AuthRouter({
    express,
    bcrypt,
    bodyValidator: body,
    validator,
    userModel,
    jwt,
  }),
);

app.use(
  `${URL_PREFIX}/venue`,
  VenueRouter({
    express,
    venueModel,
    bodyValidator: body,
    resourceModel,
    validator,
  }),
);

app.use(`${URL_PREFIX}/endpoints`, (req, res) => res.status(200).json(listEndpoints(app)));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({
    error: ['Path does not exist'],
    status: 404,
    message: "This route doesn't exist for you!",
  });
  next();
});

app.use((error, req, res, next) => {
  const responseObj = {
    status: 'error',
    message: 'Something went wrong',
    errorMessage: error.message,
  };
  if (process.env.NODE_ENV === 'development') {
    responseObj.errorStack = error.stack;
    responseObj.errors = error.errors || [];
  }
  return res.status(error.statusCode).json(responseObj);
});

// Connect to Database
db.sync()
  .then(() => {
    console.log('DB Connection has been established');
    app.listen(PORT, null, null, () => {
      app.emit('DBConnected');
    });
    console.log('App Running on PORT', PORT);
  })
  .catch((err) => {
    console.error('Failed To connect to Database', err);
  });

export default () => ({
  server: app,
  userModel,
  bookingModel,
  venueModel,
  resourceModel,
  bcrypt,
});
