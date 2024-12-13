module.exports = (sequelize, DataTypes) => {
  const ApplicantSkill = sequelize.define(
    "ApplicantSkill",
    {
      applicant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      skill_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      tableName: "applicant_skill",
      timestamps: false,
    }
  );

  return ApplicantSkill;
};
