module.exports = (sequelize, DataTypes) => {
  const ApplyJob = sequelize.define(
    "ApplyJob",
    {
      applicant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      job_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      tableName: "apply_job",
      timestamps: false,
    }
  );

  return ApplyJob;
};
