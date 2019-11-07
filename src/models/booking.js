/**
 * Booking Model Initialization Function
 * @param  {Object} RouterParams - Router Parameters
 * @param  {Object} RouterParams.Sequelize - Sequelize
 * @param  {Object} RouterParams.db - Database Connection Object
 * @param  {Object} RouterParams.User - Initialized User Model
 * @param {Object} RouterParams.Venue - Initialized Venue Model
 * @returns {Object} SequelizeModel
 */
export default ({Sequelize, db, User, Venue}) => {
	const Booking = db.define("booking", {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true
		},
		eventTitle: {
			type: Sequelize.STRING,
			allowNull: false
		},
		eventDescription: {
			type: Sequelize.STRING,
			allowNull: false
		},
		date: {
			type: Sequelize.STRING,
			allowNull: false
		},
		timeframe: {
			type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
      validate: {
        isAlphanumeric: true
      }
		},
		status: {
      type: Sequelize.STRING,
      default: 'pending'
    }
	});

	Booking.belongsTo(Venue, {constraints: true, onDelete: "CASCADE"});
	Booking.belongsTo(User, {constraints: true, onDelete: "CASCADE"});
	return Booking;
};
