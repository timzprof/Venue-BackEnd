/**
 * Venue Model Initialization Function
 * @param  {Object} RouterParams - Router Parameters
 * @param  {Object} RouterParams.Sequelize - Sequelize
 * @param  {Object} RouterParams.db - Database Connection Object
 * @param  {Object} RouterParams.User - Initialized User Model
 * @returns {Object} SequelizeModel
 */
export default ({ Sequelize, db, User }) => {
  const Venue = db.define('venue', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    capacity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    timeAllowed: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
      validate: {
        isAlphanumeric: true
      }
    }
  });
  Venue.belongsTo(User, {
    as: 'admin',
    constraints: true,
    onDelete: 'CASCADE',
  });
  return Venue;
};
