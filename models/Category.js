module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
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
      code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "categories",
      timestamps: false,
    }
  );

  return Category;
};
