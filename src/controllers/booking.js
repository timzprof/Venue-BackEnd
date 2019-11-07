import randomize from "../util/randomize";

/**
 * Booking Controlller Initialization Function
 * @param  {Object} RouterParams - Router Parameters
 * @param {Object} RouterParams.bcrypt - Bcryptjs
 * @param  {Object} RouterParams.userModel - User Model
 * @param  {Object} RouterParams.bookingeModel - Resource Model
 * @returns {Object} ControllerObject
 */
export default ({bcrypt, userModel, bookingeModel}) => {
	/**
	 * Make a Booking
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 */
	const makeBooking = async (req, res, next) => {
		try {
			const {
				eventTitle,
				eventDescription,
				date,
				timeframe,
				contactName,
				contactEmail,
				contactPhone,
				venueId
			} = req.body;
			const password = await bcrypt.hash(randomize(10), 12);
			let user = await userModel.findOne({where: {email: contactEmail}});
			if (!user) {
				user = await userModel.create({
					username: contactName,
					email: contactEmail,
					phone: contactPhone,
					password,
					type: "user"
				});
			}
			const booking = await bookingeModel.create({
				eventTitle,
				eventDescription,
				date,
				timeframe,
				venueId,
				userId: user.dataValues.id
			});
			return res.status(201).json({
				status: "success",
				message: "Booking Submitted",
				data: booking
			});
		} catch (error) {
			if (!error.statusCode) error.statusCode = 500;
			return next(error);
		}
	};
	/**
	 * Get All Bookings
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 */
	const getAllBookings = async (req, res, next) => {
		try {
			const bookings = await bookingeModel.findAll({where: {...req.query}});
			return res.status(200).json({
				status: "success",
				message: "Bookings retrieved",
				data: bookings
			});
		} catch (error) {
			if (!error.statusCode) error.statusCode = 500;
			return next(error);
		}
	};
	/**
	 * Approve a Booking
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 */
	const approveBooking = async (req, res, next) => {
		try {
			const {id} = req.params;
			let booking = await bookingeModel.findOne({where: {id}});
			if (!booking) {
				const err = new Error("Booking Not Found");
				err.statusCode = 404;
				throw err;
			}
			booking = await booking.update({status: "approved"});
			// Send Mail to user
			return res.status(200).json({
				status: "success",
				message: "Booking Approved",
				data: booking
			});
		} catch (error) {
			if (!error.statusCode) error.statusCode = 500;
			return next(error);
		}
	};
	/**
	 * Reject a Booking
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 */
	const rejectBooking = async (req, res, next) => {
		try {
			const {id} = req.params;
			let booking = await bookingeModel.findOne({where: {id}});
			if (!booking) {
				const err = new Error("Booking Not Found");
				err.statusCode = 404;
				throw err;
			}
			booking = await booking.update({status: "approved"});
			// Send Mail to user
			return res.status(200).json({
				status: "success",
				message: "Booking Rejected",
				data: booking
			});
		} catch (error) {
			if (!error.statusCode) error.statusCode = 500;
			return next(error);
		}
	};
	return {makeBooking, getAllBookings, approveBooking, rejectBooking};
};
