import AuthController from '../controllers/auth';

/**
 * Auth Router Initialization Function
 * @param  {Object} RouterParams - Router Parameters
 * @param  {Object} RouterParams.express - Express
 * @param  {Object} RouterParams.jwt - Jsonwebtoken
 * @param  {Object} RouterParams.bcrypt - bcryptjs
 * @param  {Object} RouterParams.userModel - User Model
 * @param  {Function} RouterParams.bodyValidator - Exress Validator(body)
 * @param  {Object} RouterParams.validator - Custom Validator
 * @returns {Object} ExpressRouter
 */
export default ({
  express,
  jwt,
  bcrypt,
  userModel,
  bodyValidator,
  validator,
}) => {
  const authController = AuthController({ jwt, bcrypt, userModel });
  const authRouter = express.Router();

  authRouter.post(
    '/login',
    [
      bodyValidator('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail({
          gmail_remove_subaddress: false,
          gmail_remove_dots: false,
        }),
      bodyValidator('password')
        .trim()
        .isLength({ min: 5 }),
    ],
    validator,
    authController.login,
  );

  return authRouter;
};
