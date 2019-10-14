import VenueController from "../controllers/venue";
import {verifyToken, verifyAdmin} from "../util/auth";

export default ({
	express,
	venueModel,
	bodyValidator,
	validator,
	resourceModel
}) => {
	const venueController = VenueController({venueModel, resourceModel});
	const venueRouter = express.Router();

	venueRouter.get("/", venueController.getVenues);

	venueRouter.post(
		"/",
		verifyToken,
		verifyAdmin,
		[
			bodyValidator("title")
				.trim()
				.not()
				.isEmpty(),
			bodyValidator("address")
				.trim()
				.not()
				.isEmpty(),
			bodyValidator("capacity")
				.trim()
				.not()
				.isEmpty(),
			bodyValidator("resources")
				.isArray()
				.not()
				.isEmpty()
		],
		validator,
		venueController.createVenue
	);

	venueRouter.put(
		"/:id",
		verifyToken,
		verifyAdmin,
		[
			bodyValidator("title")
				.trim(),
			bodyValidator("address")
				.trim(),
			bodyValidator("capacity")
				.trim(),
			bodyValidator("resources")
				.isArray()
		],
		venueController.updateVenue
	);

	venueRouter.delete(
		"/:id",
		verifyToken,
		verifyAdmin,
		venueController.deleteVenue
	);

	return venueRouter;
};
