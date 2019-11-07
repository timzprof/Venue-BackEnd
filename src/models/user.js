/**
 * User Model Initialization Function
 * @param  {Object} RouterParams - Router Parameters
 * @param  {Object} RouterParams.Sequelize - Sequelize
 * @param  {Object} RouterParams.db - Database Connection Object
 * @returns {Object} SequelizeModel
 */
export default ({ Sequelize, db }) => {
  const User = db.define('user', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      default: 'user',
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  return User;
};
