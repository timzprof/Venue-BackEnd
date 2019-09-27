const verifyToken = async (req, res, next) => {
	let token = req.headers["x-access-token"] || req.headers.authorization;

	if (!token) {
		return res.status(401).json({
			status: "error",
			message: "No Auth Token Provided"
		});
	}

	token = token.slice(7, token.length);

	try {
		const decoded = await jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded.user;
		return next();
	} catch (error) {
		return res.status(401).json({
			status: "error",
			message: "Token is not valid"
		});
	}
};

module.exports = {verifyToken};
