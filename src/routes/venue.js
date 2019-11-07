import VenueController from '../controllers/venue';
import auth from '../util/auth';

/**
 * Venue Router Initialization Function
 * @param  {Object} RouterParams - Router Parameters
 * @param  {Object} RouterParams.express - Express
 * @param  {Object} RouterParams.venueModel - Venue Model
 * @param  {Function} RouterParams.bodyValidator - Express Validator(body)
 * @param  {Object} RouterParams.validator - Custom Validator
 * @param  {Object} RouterParams.resourceModel - Resource Model
 * @returns {Object} ExpressRouter
 */
export default ({
  express,
  venueModel,
  bodyValidator,
  validator,
  resourceModel,
}) => {
  const venueController = VenueController({ venueModel, resourceModel });
  const venueRouter = express.Router();

  venueRouter.get('/', venueController.getVenues);

  venueRouter.get('/:id', venueController.getSingleVenue);

  venueRouter.post(
    '/',
    auth.verifyToken,
    auth.verifyAdmin,
    [
      bodyValidator('title')
        .trim()
        .not()
        .isEmpty(),
      bodyValidator('address')
        .trim()
        .not()
        .isEmpty(),
      bodyValidator('capacity')
        .trim()
        .not()
        .isEmpty(),
      bodyValidator('resources')
        .isArray()
        .not()
        .isEmpty(),
    ],
    validator,
    venueController.createVenue,
  );

  venueRouter.put(
    '/:id',
    auth.verifyToken,
    auth.verifyAdmin,
    [
      bodyValidator('title').trim(),
      bodyValidator('address').trim(),
      bodyValidator('capacity').trim(),
      bodyValidator('resources').isArray(),
    ],
    venueController.updateVenue,
  );

  venueRouter.delete(
    '/:id',
    auth.verifyToken,
    auth.verifyAdmin,
    venueController.deleteVenue,
  );

  return venueRouter;
};
