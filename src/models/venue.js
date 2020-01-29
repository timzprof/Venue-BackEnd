/**
 * Venue Model Initialization Function
 * @param  {Object} ModelParams - Model Parameters
 * @param  {Object} ModelParams.Sequelize - Sequelize
 * @param  {Object} ModelParams.db - Database Connection Object
 * @param  {Object} ModelParams.User - Initialized User Model
 * @param  {Object} ModelParams.Resource - Initialized Resource Model
 * @returns {Object} SequelizeModel
 */
export default ({Sequelize, db, User, Resource}) => {
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
    featureImage: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    otherImages: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
    },
    timeAllowed: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
    },
  });
  Venue.belongsTo(User, {
    as: 'admin',
    constraints: true,
    onDelete: 'CASCADE',
  });
  Venue.hasMany(Resource, {constraints: true, onDelete: 'CASCADE'});
  return Venue;
};
