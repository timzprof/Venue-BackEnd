import randomize from "../util/randomize";
import mailService from "../util/mail";

/**
 * Booking Controlller Initialization Function
 * @param  {Object} RouterParams - Router Parameters
 * @param {Object} RouterParams.bcrypt - Bcryptjs
 * @param  {Object} RouterParams.userModel - User Model
 * @param  {Object} RouterParams.bookingModel - Resource Model
 * @returns {Object} ControllerObject
 */
export default ({bcrypt, userModel, bookingModel, venueModel}) => {
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
			const booking = await bookingModel.create({
				eventTitle,
				eventDescription,
				date,
				timeframe,
				venueId,
				userId: user.dataValues.id,
				status: "pending"
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
			const {status} = req.query;
			const config = {
				include: [
					{
						model: venueModel,
						attributes: ["title", "address", "capacity", "adminId"],
						where: {
							adminId: req.user.id
						}
					}
				]
			};
			if (status) config.where = {status};
			const bookings = await bookingModel.findAll(config);
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
			let booking = await bookingModel.findOne({
				where: {id},
				include: [
					{
						model: userModel,
						attributes: ["username", "email"]
					}
				]
			});
			if (!booking) {
				const err = new Error("Booking Not Found");
				err.statusCode = 404;
				throw err;
			}
			booking = await booking.update({status: "approved"});
			await mailService.sendMail({
				to: booking.user.dataValues.email,
				bcc: [req.user.email],
				from: req.user.email,
				subject: "Venue Booking Approved",
				html: `
					<p>Hello ${booking.user.dataValues.username},</p>

					<p>Your venue booking has been approved. You will be duely contacted regarding the negotiations soon</p>
				`,
				replyTo: req.user.email
			});
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
			let booking = await bookingModel.findOne({
				where: {id},
				include: [
					{
						model: userModel,
						attributes: ["username", "email"]
					}
				]
			});
			if (!booking) {
				const err = new Error("Booking Not Found");
				err.statusCode = 404;
				throw err;
			}
			booking = await booking.update({status: "rejected"});
			await mailService.sendMail({
				to: booking.user.dataValues.email,
				bcc: [req.user.email],
				from: req.user.email,
				subject: "Venue Booking Rejected",
				html: `
					<p>Hello ${booking.user.dataValues.username},</p>

					<p>Your venue booking has been rejected.</p>
				`,
				replyTo: req.user.email
			});
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
