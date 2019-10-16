export default ({ Sequelize }) => {
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
  });

  return sequelize;
};
