/**
 * Booking Model Initialization Function
 * @param  {Object} ModelParams - Model Parameters
 * @param  {Object} ModelParams.Sequelize - Sequelize
 * @param  {Object} ModelParams.db - Database Connection Object
 * @param  {Object} ModelParams.User - Initialized User Model
 * @param {Object} ModelParams.Venue - Initialized Venue Model
 * @returns {Object} SequelizeModel
 */
export default ({Sequelize, db, User, Venue}) => {
  const Booking = db.define('booking', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    eventTitle: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    eventDescription: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    timeframe: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNUll: false,
    },
  });

  Booking.belongsTo(Venue, {constraints: true, onDelete: 'CASCADE'});
  Booking.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
  return Booking;
};
