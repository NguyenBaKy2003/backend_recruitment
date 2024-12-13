module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    "Service",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      create_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      create_by: DataTypes.STRING,
      delete_at: DataTypes.DATE,
      delete_by: DataTypes.STRING,
      update_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      update_by: DataTypes.STRING,
      jobPostNumber: DataTypes.INTEGER,
      service_name: DataTypes.STRING,
      price: DataTypes.DECIMAL(10, 2),
      status: DataTypes.STRING,
    },
    {
      tableName: "services",
      timestamps: false,
    }
  );

  return Service;
};
