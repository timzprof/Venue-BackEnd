export default ({Sequelize, db, User}) => {
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
		contactEmail: {
			type: Sequelize.STRING,
			allowNull: false
		},
		contactPhone: {
			type: Sequelize.STRING,
			allowNull: false
		},
		dateTime: {
			type: Sequelize.STRING,
			allowNull: false
		},
		userId: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		venueId: {
			type: Sequelize.INTEGER,
			allowNull: false
		}
	});

	Booking.belongsTo(User, {constraints: true, onDelete: "CASCADE"});

	return Booking;
};
