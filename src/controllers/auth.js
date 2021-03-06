/**
 * Auth Controller Initialization Function
 * @param  {Object} ControllerParams - Controller Parameters
 * @param  {Object} ControllerParams.jwt - Jsonwebtoken
 * @param  {Object} ControllerParams.bcrypt - bcryptjs
 * @param  {Object} ControllerParams.userModel - User Model
 * @returns {Object} ControllerObject
 */
export default ({jwt, userModel, bcrypt}) => {
  const login = async (req, res, next) => {
    try {
      const {email, password} = req.body;
      const user = await userModel.findOne({where: {email}});
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User Not Found',
        });
      }
      const passwordCheck = await bcrypt.compare(password, user.password);
      if (!passwordCheck) {
        return res.status(400).json({
          status: 'error',
          message: 'Incorrect Password',
        });
      }

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
      };

      const token = jwt.sign({user: safeUser}, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });
      return res.status(200).json({
        status: 'success',
        message: 'Logged In',
        token,
        user: safeUser,
      });
    } catch (error) {
      return next(error);
    }
  };
  return {login};
};
