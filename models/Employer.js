module.exports = (sequelize, DataTypes) => {
  const Employer = sequelize.define(
    "Employer",
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
      company_address: DataTypes.STRING,
      company_introduce: DataTypes.TEXT,
      company_name: DataTypes.STRING,
      position: DataTypes.STRING,
      service_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
    },
    {
      tableName: "employer",
      timestamps: false,
    }
  );

  return Employer;
};
