module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define(
    "Job",
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
      application_deadline: DataTypes.DATE,
      benefit: DataTypes.TEXT,
      description: DataTypes.TEXT,
      location: DataTypes.STRING,
      position: DataTypes.STRING,
      requirements: DataTypes.TEXT,
      salary: DataTypes.DECIMAL(10, 2),
      title: DataTypes.STRING,
      type: DataTypes.STRING,
      category_id: DataTypes.INTEGER,
      employer_id: DataTypes.INTEGER,
    },
    {
      tableName: "jobs",
      timestamps: false,
    }
  );

  return Job;
};
