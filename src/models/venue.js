export default ({Sequelize, db}) => {
	const Venue = db.define("venue", {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true
		},
		title: {
			type: Sequelize.STRING,
			allowNull: false
		},
		address: {
			type: Sequelize.STRING,
			allowNull: false
        },
        capacity: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
		imageUrl: {
			type: Sequelize.STRING,
			allowNull: false
		},
		resources: {
			type: Sequelize.STRING
		}
	});

	return Venue;
};
