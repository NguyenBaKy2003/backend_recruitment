module.exports = (sequelize, DataTypes) => {
  const JobSkill = sequelize.define(
    "JobSkill",
    {
      job_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      skill_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      tableName: "job_skill",
      timestamps: false,
    }
  );
  return JobSkill;
};
