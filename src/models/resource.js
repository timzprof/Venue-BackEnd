/**
 * Resource Model Initialization Function
 * @param  {Object} RouterParams - Router Parameters
 * @param  {Object} RouterParams.Sequelize - Sequelize
 * @param  {Object} RouterParams.db - Database Connection Object
 * @param  {Object} RouterParams.Venue - Initialized Venue Model
 * @returns {Object} SequelizeModel
 */
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
