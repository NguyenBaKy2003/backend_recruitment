module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
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
      address: DataTypes.TEXT,
      email: DataTypes.STRING,
      userName: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      password: DataTypes.STRING,
      phone: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      tableName: "users",
      timestamps: false,
    }
  );

  return User;
};
