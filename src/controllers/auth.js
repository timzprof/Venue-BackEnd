export default ({jwt, userModel, bcrypt}) => {
	const login = async (req, res) => {
		try {
			const {email, password} = req.body;
			const user = await userModel.findOne({where: {email}});
			if (!user) {
				return res.status(404).json({
					message: "User Not Found"
				});
			}
			const passwordCheck = await bcrypt.compare(password, user.password);
			if (!passwordCheck) {
				return res.status(400).json({
					message: "Incorrect Password"
				});
			}

			const safeUser = {
				id: user.id,
				name: user.name,
				email: user.email,
				type: user.type
			};
			const token = jwt.sign({user: safeUser}, process.env.JWT_SECRET, {
				expiresIn: "24h"
			});
			return res.status(200).json({
				status: "success",
				message: "Logged In",
				token,
				user: safeUser
			});
		} catch (err) {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		}
	};
	return {login};
};
