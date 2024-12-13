module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define(
    "User Role",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      tableName: "user_role",
      timestamps: false,
    }
  );

  return UserRole;
};
