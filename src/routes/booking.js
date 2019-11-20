import BookingController from "../controllers/booking";
import auth from "../util/auth";

/**
 * Booking Router Initialization Function
 * @param  {Object} RouterParams - Router Parameters
 * @param  {Object} RouterParams.express - Express
 * @param {Object} RouterParams.bcrypt - Bcryptjs
 * @param  {Object} RouterParams.userModel - User Model
 * @param  {Function} RouterParams.expressValidator - Express Validator(check)
 * @param  {Object} RouterParams.validator - Custom Validator
 * @param  {Object} RouterParams.bookingeModel - Resource Model
 * @param {Object} RouterParams.venueModel
 * @returns {Object} ExpressRouter
 */
export default ({
	express,
	bcrypt,
	expressValidator,
	validator,
	userModel,
	bookingModel,
	venueModel
}) => {
	const bookingController = BookingController({
		bcrypt,
		userModel,
		bookingModel,
		venueModel
	});
	const bookingRouter = express.Router();

	bookingRouter.get(
		"/",
		auth.verifyToken,
		auth.verifyAdmin,
		bookingController.getAllBookings
	);

	bookingRouter.post(
		"/",
		[
			expressValidator("eventTitle")
				.trim()
				.not()
				.isEmpty(),
			expressValidator("eventDescription")
				.trim()
				.not()
				.isEmpty(),
			expressValidator("date")
				.trim()
				.not()
				.isEmpty(),
			expressValidator("timeframe")
				.isArray()
				.not()
				.isEmpty(),
			expressValidator("contactName")
				.trim()
				.not()
				.isEmpty(),
			expressValidator("contactEmail")
				.trim()
				.isEmail()
				.not()
				.isEmpty(),
			expressValidator("contactPhone")
				.trim()
				.not()
				.isEmpty(),
			expressValidator("venueId")
				.trim()
				.not()
				.isEmpty()
		],
		validator,
		bookingController.makeBooking
	);

	bookingRouter.patch(
		"/:id/approve",
		auth.verifyToken,
		auth.verifyAdmin,
		bookingController.approveBooking
	);

	bookingRouter.patch(
		"/:id/reject",
		auth.verifyToken,
		auth.verifyAdmin,
		bookingController.rejectBooking
	);

	return bookingRouter;
};
