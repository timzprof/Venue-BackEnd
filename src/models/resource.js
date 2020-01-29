/**
 * Resource Model Initialization Function
 * @param  {Object} ModelParams - Model Parameters
 * @param  {Object} ModelParams.Sequelize - Sequelize
 * @param  {Object} ModelParams.db - Database Connection Object
 * @returns {Object} SequelizeModel
 */
export default ({Sequelize, db}) => {
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

  return Resource;
};
