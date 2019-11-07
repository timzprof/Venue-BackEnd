import BookingController from "../controllers/booking";
import auth from "../util/auth";

/**
 * Booking Router Initialization Function
 * @param  {Object} RouterParams - Router Parameters
 * @param  {Object} RouterParams.express - Express
 * @param {Object} RouterParams.bcrypt - Bcryptjs
 * @param  {Object} RouterParams.userModel - User Model
 * @param  {Function} RouterParams.bodyValidator - Express Validator(body)
 * @param  {Object} RouterParams.validator - Custom Validator
 * @param  {Object} RouterParams.bookingeModel - Resource Model
 * @returns {Object} ExpressRouter
 */
export default ({
	express,
	bcrypt,
	bodyValidator,
	validator,
	userModel,
	bookingModel
}) => {
	const bookingController = BookingController({
		bcrypt,
		userModel,
		bookingModel
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
			bodyValidator("eventTitle")
				.trim()
				.not()
				.isEmpty(),
			bodyValidator("eventDescription")
				.trim()
				.not()
				.isEmpty(),
			bodyValidator("date")
				.trim()
				.not()
				.isEmpty(),
			bodyValidator("timeframe")
				.isArray()
				.not()
				.isEmpty(),
			bodyValidator("contactName")
				.trim()
				.not()
				.isEmpty(),
			bodyValidator("contactEmail")
				.trim()
				.not()
				.isEmpty(),
			bodyValidator("contactPhone")
				.trim()
				.not()
				.isEmpty(),
			bodyValidator("venueId")
				.trim()
				.not()
				.isEmpty()
		],
		validator,
		bookingController.makeBooking
	);

	bookingRouter.put(
		"/:id/approve",
		auth.verifyToken,
		auth.verifyAdmin,
		bookingController.approveBooking
	);

	bookingRouter.put(
		"/:id/reject",
		auth.verifyToken,
		auth.verifyAdmin,
		bookingController.rejectBooking
	);

	return bookingRouter;
};
