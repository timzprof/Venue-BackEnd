import AuthController from "../controllers/auth";

export default ({
	express,
	jwt,
	bcrypt,
	userModel,
	bodyValidator,
	validator
}) => {
	const authController = AuthController({jwt, bcrypt, userModel});
	const authRouter = express.Router();

	authRouter.post(
		"/login",
		[
			bodyValidator("email")
				.isEmail()
				.withMessage("Please enter a valid email"),
			bodyValidator("password")
				.trim()
				.isLength({min: 5})
		],
		validator,
		authController.login
	);

	return authRouter;
};
