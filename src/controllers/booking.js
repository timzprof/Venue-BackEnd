import mailService from '../util/mail';
import {APIError, convertTime, randomize} from '../util/helpers';

/**
 * Booking Controlller Initialization Function
 * @param  {Object} ControllerParams - Controller Parameters
 * @param {Object} ControllerParams.bcrypt - Bcryptjs
 * @param  {Object} ControllerParams.userModel - User Model
 * @param  {Object} ControllerParams.bookingModel - Resource Model
 * @returns {Object} ControllerObject
 */
export default ({bcrypt, userModel, bookingModel, venueModel}) => {
  // Helper Methods
  const validateTimeframe = (newBookingTimeframe, acceptedBookingTimeframe) => {
    const [newBookingStartTime, newBookingEndTime] = newBookingTimeframe.map(
      convertTime
    );
    const [startTime, endTime] = acceptedBookingTimeframe.map(convertTime);
    if (
      (startTime < newBookingStartTime && newBookingStartTime < endTime) ||
      (startTime < newBookingEndTime && newBookingEndTime < endTime)
    ) {
      const invalidBookingError = new APIError(
        'Booking timeframe is invalid due to another accepted booking',
        400
      );
      throw invalidBookingError;
    }
  };

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
        venueId,
      } = req.body;
      const password = await bcrypt.hash(randomize(10), 12);
      let user = await userModel.findOne({where: {email: contactEmail}});
      if (!user) {
        user = await userModel.create({
          username: contactName,
          email: contactEmail,
          phone: contactPhone,
          password,
          type: 'user',
        });
      }
      // Validate Booking Timeframe for the date requested
      const bookingsByDate = await bookingModel.findAll({
        where: {date, status: 'accepted'},
      });
      bookingsByDate.forEach(booking => {
        validateTimeframe(timeframe, booking.dataValues.timeframe);
      });
      // Create New Booking
      const booking = await bookingModel.create({
        eventTitle,
        eventDescription,
        date,
        timeframe,
        venueId,
        userId: user.dataValues.id,
        status: 'pending',
      });
      const venue = await venueModel.findOne({
        where: {id: venueId},
        include: [
          {
            model: userModel,
            attributes: ['username', 'email'],
            as: 'admin',
          },
        ],
      });
      await mailService.sendMail({
        to: venue.admin.dataValues.email,
        bcc: [contactEmail],
        from: 'venue@cits.unilag.edu.ng',
        subject: 'New Venue Booking',
        html: `
					<p>Hello ${venue.admin.dataValues.username},</p>

					<p>A new booking has been made for the venue: ${venue.dataValues.title}</p>
				`,
      });
      return res.status(201).json({
        status: 'success',
        message: 'Booking Submitted',
        data: booking,
      });
    } catch (error) {
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
      const config = {
        where: {...req.query},
        include: [
          {
            model: venueModel,
            attributes: ['id', 'title', 'address', 'capacity', 'adminId'],
          },
          {
            model: userModel,
            attributes: ['id', 'username', 'email', 'phone'],
          },
        ],
      };
      if (req.user) {
        config.include[0].where = {adminId: req.user.id};
      }
      const bookings = await bookingModel.findAll(config);
      return res.status(200).json({
        status: 'success',
        message: 'Bookings retrieved',
        data: bookings,
      });
    } catch (error) {
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
      const {bookingId} = req.body;
      let booking = await bookingModel.findOne({
        where: {id: bookingId},
        include: [
          {
            model: userModel,
            attributes: ['username', 'email'],
          },
        ],
      });
      if (!booking) {
        const err = new Error('Booking Not Found');
        err.statusCode = 404;
        throw err;
      }
      booking = await booking.update({status: 'approved'});
      await mailService.sendMail({
        to: booking.user.dataValues.email,
        bcc: [req.user.email],
        from: req.user.email,
        subject: 'Venue Booking Approved',
        html: `
					<p>Hello ${booking.user.dataValues.username},</p>

					<p>Your venue booking has been approved. You will be duely contacted regarding the negotiations soon</p>
				`,
        replyTo: req.user.email,
      });
      return res.status(200).json({
        status: 'success',
        message: 'Booking Approved',
        data: booking,
      });
    } catch (error) {
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
      const {bookingId} = req.body;
      let booking = await bookingModel.findOne({
        where: {id: bookingId},
        include: [
          {
            model: userModel,
            attributes: ['username', 'email'],
          },
        ],
      });
      if (!booking) {
        const err = new Error('Booking Not Found');
        err.statusCode = 404;
        throw err;
      }
      booking = await booking.update({status: 'rejected'});
      await mailService.sendMail({
        to: booking.user.dataValues.email,
        bcc: [req.user.email],
        from: req.user.email,
        subject: 'Venue Booking Rejected',
        html: `
					<p>Hello ${booking.user.dataValues.username},</p>

					<p>Your venue booking has been rejected.</p>
				`,
        replyTo: req.user.email,
      });
      return res.status(200).json({
        status: 'success',
        message: 'Booking Rejected',
        data: booking,
      });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Disable a date for a venue for booking
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  const disableVenueByDateTime = async (req, res, next) => {
    try {
      const {date, timeframe, venueId} = req.body;
      const venue = await venueModel.findOne({where: {id: venueId}});
      const booking = await bookingModel.create({
        eventTitle: 'Date Not Available',
        eventDescription: 'Booking of this venue on this date is restricted',
        date,
        timeframe: timeframe || venue.dataValues.timeAllowed,
        venueId,
        userId: req.user.id,
        status: 'disabled',
      });
      return res.status(201).json({
        status: 'success',
        message: 'Date Disabled for Booking',
        data: booking,
      });
    } catch (error) {
      return next(error);
    }
  };

  return {
    makeBooking,
    getAllBookings,
    approveBooking,
    rejectBooking,
    disableVenueByDateTime,
  };
};
