import jwt from 'jsonwebtoken';

const verifyToken = async (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'No Auth Token Provided',
    });
  }

  token = token.slice(7, token.length);

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    return next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token is not valid',
    });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user.type !== 'admin') {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized',
    });
  }
  return next();
};

export default {verifyToken, verifyAdmin};
