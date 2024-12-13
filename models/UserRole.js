module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define(
    "UserRole", // Correct model name (no space)
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
      },
    },
    {
      tableName: "user_role",
      timestamps: false,
    }
  );

  return UserRole;
};
