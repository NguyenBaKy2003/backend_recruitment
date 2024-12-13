module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define(
    "Skill",
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
      name: DataTypes.STRING,
      category_id: DataTypes.INTEGER,
    },
    {
      tableName: "skill",
      timestamps: false,
    }
  );

  return Skill;
};
