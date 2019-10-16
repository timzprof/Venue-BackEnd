export default ({ Sequelize, db, Venue }) => {
  const Resource = db.define('resource', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    value: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    venueId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });

  Resource.belongsTo(Venue, { constraints: true, onDelete: 'CASCADE' });

  return Resource;
};
