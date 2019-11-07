/**
 * Venue Controller Initialization Function
 * @param  {Object} RouterParams - Router Parameters
 * @param  {Object} RouterParams.venueModel - Venue Model
 * @param  {Object} RouterParams.resourceModel - Resource Model
 * @returns {Object} ControllerObject
 */
export default ({ venueModel, resourceModel }) => {
  /**
	 * Get All Venues
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 */
  const getVenues = async (req, res, next) => {
    try {
      const venues = await venueModel.findAll();
      return res.status(200).json({
        status: 'success',
        message: 'Venues Retrieved',
        data: venues,
      });
    } catch (error) {
      if (!error.statusCode) error.statusCode = 500;
      return next(error);
    }
  };
  /**
	 * Create a New Venue
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 */
  const createVenue = async (req, res, next) => {
    try {
      const {
        title, address, capacity, resources,
      } = req.body;
      const venue = await venueModel.create({
        title,
        address,
        capacity,
        imageUrl: 'test.png',
        adminId: req.user.id,
      });
      const venueObj = {
        ...venue.dataValues,
        resources: [],
      };
      for await (const resource of resources) {
        const resc = await resourceModel.create({
          name: resource.name,
          value: resource.value,
          venueId: venue.dataValues.id,
        });
        venueObj.resources.push({ ...resc.dataValues });
      }
      return res.status(201).json({
        status: 'success',
        message: 'Venue Created',
        data: venueObj,
      });
    } catch (error) {
      if (!error.statusCode) error.statusCode = 500;
      return next(error);
    }
  };
  /**
	 * Delete A Venue
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 */
  const deleteVenue = async (req, res, next) => {
    try {
      const { id } = req.params;
      const venue = await venueModel.findOne({ where: { id } });
      if (!venue) {
        return res.status(404).json({
          status: 'error',
          message: 'Venue Not Found',
        });
      }
      if (venue.adminId !== req.user.id) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
      }
      await venue.destroy();
      return res.status(200).json({
        status: 'success',
        message: 'Venue Deleted',
      });
    } catch (error) {
      if (!error.statusCode) error.statusCode = 500;
      return next(error);
    }
  };
  /**
	 * Update a Venues Details
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 */
  const updateVenue = async (req, res, next) => {
    try {
      const { id } = req.params;
      const venue = await venueModel.findOne({ where: { id } });
      if (!venue) {
        return res.status(404).json({
          status: 'error',
          message: 'Venue Not Found',
        });
      }
      const {
        title, address, capacity, resources,
      } = req.body;
      const updatedVenue = await venue.update({
        title: title || venue.dataValues.title,
        address: address || venue.dataValues.address,
        capacity: capacity || venue.dataValues.capacity,
      });
      const venueObj = {
        ...updatedVenue.dataValues,
      };
      if (resources) {
        venueObj.resources = [];
        await resourceModel.destroy({
          where: { venueId: venue.dataValues.id },
        });
        for await (const resource of resources) {
          const resc = await resourceModel.create({
            name: resource.name,
            value: resource.value,
            venueId: venue.dataValues.id,
          });
          venueObj.resources.push({ ...resc.dataValues });
        }
      }
      return res.status(200).json({
        status: 'success',
        message: 'Venue Updated',
        data: venueObj,
      });
    } catch (error) {
      if (!error.statusCode) error.statusCode = 500;
      return next(error);
    }
  };
  /**
	 * Get A Single Venue
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 */
  const getSingleVenue = async (req, res, next) => {
    try {
      const { id } = req.params;
      const venue = await venueModel.findOne({ where: { id } });
      return res.status(200).json({
        status: 'success',
        message: 'Venue Retrived',
        data: venue,
      });
    } catch (error) {
      if (!error.statusCode) error.statusCode = 500;
      return next(error);
    }
  };
  return {
    getVenues,
    createVenue,
    deleteVenue,
    updateVenue,
    getSingleVenue,
  };
};
