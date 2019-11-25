import VenueController from '../controllers/venue';
import auth from '../util/auth';

/**
 * Venue Router Initialization Function
 * @param  {Object} RouterParams - Router Parameters
 * @param  {Object} RouterParams.express - Express
 * @param  {Object} RouterParams.venueModel - Venue Model
 * @param  {Function} RouterParams.expressValidator - Express Validator(check)
 * @param  {Object} RouterParams.validator - Custom Validator
 * @param  {Object} RouterParams.resourceModel - Resource Model
 * @returns {Object} ExpressRouter
 */
export default ({
  express,
  venueModel,
  expressValidator,
  validator,
  resourceModel,
}) => {
  const venueController = VenueController({venueModel, resourceModel});
  const venueRouter = express.Router();

  venueRouter.get('/', venueController.getVenues);

  venueRouter.get('/:id', venueController.getSingleVenue);

  venueRouter.post(
    '/',
    auth.verifyToken,
    auth.verifyAdmin,
    [
      expressValidator('title')
        .trim()
        .not()
        .isEmpty(),
      expressValidator('address')
        .trim()
        .not()
        .isEmpty(),
      expressValidator('capacity')
        .trim()
        .not()
        .isEmpty(),
      expressValidator('resources')
        .not()
        .isEmpty(),
      expressValidator('timeAllowed')
        .not()
        .isEmpty(),
      expressValidator('featureImage').custom((value, {req}) => {
        if (!req.files.featureImage) {
        	throw new Error("Feature Image Required");
        }
        return true;
      }),
    ],
    validator,
    venueController.createVenue
  );

  venueRouter.put(
    '/:id',
    auth.verifyToken,
    auth.verifyAdmin,
    [
      expressValidator('title').trim(),
      expressValidator('address').trim(),
      expressValidator('capacity').trim(),
      expressValidator('resources').trim(),
      expressValidator('timeAllowed').trim(),
    ],
    venueController.updateVenue
  );

  venueRouter.delete(
    '/:id',
    auth.verifyToken,
    auth.verifyAdmin,
    venueController.deleteVenue
  );

  return venueRouter;
};
