export default ({venueModel, resourceModel}) => {
	const getVenues = async (req, res, next) => {
		try {
			const venues = await venueModel.findAll();
			return res.status(200).json({
				status: "success",
				message: "Venues Retrived",
				data: venues
			});
		} catch (error) {
			if (!error.statusCode) error.statusCode = 500;
			next(error);
		}
	};
	const createVenue = async (req, res, next) => {
		try {
			const {title, address, capacity, resources} = req.body;
			const venue = await venueModel.create({
				title,
				address,
				capacity,
				imageUrl: "test.png",
				adminId: req.user.id
			});
			const venueObj = {
				...venue.dataValues,
				resources: []
			};
			for await (let resource of resources) {
				const resc = await resourceModel.create({
					name: resource.name,
					value: resource.value,
					venueId: venue.dataValues.id
				});
				venueObj.resources.push({...resc.dataValues});
			}
			return res.status(201).json({
				status: "success",
				message: "Venue Created",
				data: venueObj
			});
		} catch (error) {
			if (!error.statusCode) error.statusCode = 500;
			next(error);
		}
	};

	const deleteVenue = async (req, res, next) => {
		try {
			const {id} = req.params;
			const venue = await venueModel.findOne({where: {id}});
			if (!venue) {
				return res.status(404).json({
					status: "error",
					message: "Venue Not Found"
				});
			}
			if (venue.adminId !== req.user.id) {
				return res.status(401).json({
					status: "error",
					message: "Unauthorized"
				});
			}
			await venue.destroy();
			return res.status(200).json({
				status: "success",
				message: "Venue Deleted"
			});
		} catch (error) {
			if (!error.statusCode) error.statusCode = 500;
			next(error);
		}
	};

	const updateVenue = async (req, res, next) => {
		try {
			const {id} = req.params;
			const venue = await venueModel.findOne({where: {id}});
			if (!venue) {
				return res.status(404).json({
					status: "error",
					message: "Venue Not Found"
				});
			}
			const {title, address, capacity, resources} = req.body;
			const updatedVenue = await venue.update({
				title: title || venue.dataValues.title,
				address: address || venue.dataValues.address,
				capacity: capacity || venue.dataValues.capacity
			});
			const venueObj = {
				...updatedVenue.dataValues
			};
			if (resources) {
				venueObj.resources = [];
				await resourceModel.destroy({
					where: {venueId: venue.dataValues.id}
				});
				for await (let resource of resources) {
					const resc = await resourceModel.create({
						name: resource.name,
						value: resource.value,
						venueId: venue.dataValues.id
					});
					venueObj.resources.push({...resc.dataValues});
				}
			}
			return res.status(200).json({
				status: "success",
				message: "Venue Updated",
				data: venueObj
			});
		} catch (error) {
			if (!error.statusCode) error.statusCode = 500;
			next(error);
		}
	};
	return {getVenues, createVenue, deleteVenue, updateVenue};
};
