const Sequelize = require("sequelize");
const sequelize = require("../config/database"); // Đường dẫn đến tệp database.js

const Role = require("./Role")(sequelize, Sequelize.DataTypes);
const User = require("./User")(sequelize, Sequelize.DataTypes);
const Employer = require("./Employer")(sequelize, Sequelize.DataTypes);
const Service = require("./Service")(sequelize, Sequelize.DataTypes);
const Applicant = require("./Applicant")(sequelize, Sequelize.DataTypes);
const Skill = require("./Skill")(sequelize, Sequelize.DataTypes);
const Job = require("./Job")(sequelize, Sequelize.DataTypes);
const Category = require("./Category")(sequelize, Sequelize.DataTypes);
const Position = require("./Position")(sequelize, Sequelize.DataTypes);
const UserRole = require("./UserRole")(sequelize, Sequelize.DataTypes);
const ApplicantSkill = require("./ApplicantSkill")(
  sequelize,
  Sequelize.DataTypes
);
const JobSkill = require("./JobSkill")(sequelize, Sequelize.DataTypes);
const ApplyJob = require("./ApplyJob")(sequelize, Sequelize.DataTypes);

// Thiết lập mối quan hệ

User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: "role_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Applicant and User Relationship (One-to-One with Cascade Delete)
Applicant.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE", // Cascade delete on Applicant if User is deleted
  onUpdate: "CASCADE", // Cascade update on Applicant if User is updated
});
User.hasOne(Applicant, { foreignKey: "user_id" });

// Employer and User Relationship (One-to-One with Cascade Delete)
Employer.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE", // Cascade delete on Employer if User is deleted
  onUpdate: "CASCADE", // Cascade update on Employer if User is updated
});
User.hasOne(Employer, { foreignKey: "user_id" });

// Job and Employer Relationship (Many-to-One with Cascade Delete)
Job.belongsTo(Employer, {
  foreignKey: "employer_id",
  onDelete: "CASCADE", // Cascade delete on Job if Employer is deleted
  onUpdate: "CASCADE", // Cascade update on Job if Employer is updated
});
Employer.hasMany(Job, { foreignKey: "employer_id" });

// Job and Category Relationship (Many-to-One with Cascade Delete)
Job.belongsTo(Category, {
  foreignKey: "category_id",
  onDelete: "CASCADE", // Cascade delete on Job if Category is deleted
  onUpdate: "CASCADE", // Cascade update on Job if Category is updated
});
Category.hasMany(Job, { foreignKey: "category_id" });

// Skill and Applicant Relationship (Many-to-Many with Cascade Delete)
Applicant.belongsToMany(Skill, {
  through: ApplicantSkill,
  foreignKey: "applicant_id",
  onDelete: "CASCADE", // Cascade delete on ApplicantSkill if Applicant is deleted
  onUpdate: "CASCADE", // Cascade update on ApplicantSkill if Applicant is updated
});
Skill.belongsToMany(Applicant, {
  through: ApplicantSkill,
  foreignKey: "skill_id",
  onDelete: "CASCADE", // Cascade delete on ApplicantSkill if Skill is deleted
  onUpdate: "CASCADE", // Cascade update on ApplicantSkill if Skill is updated
});

// Job and Skill Relationship (Many-to-Many with Cascade Delete)
Job.belongsToMany(Skill, {
  through: JobSkill,
  foreignKey: "job_id",
  otherKey: "skill_id",
});

Skill.belongsToMany(Job, {
  through: JobSkill,
  foreignKey: "skill_id",
  otherKey: "job_id",
});
// Applicant and Job Relationship (Many-to-Many with Cascade Delete)
Applicant.belongsToMany(Job, {
  through: ApplyJob,
  foreignKey: "applicant_id",
  onDelete: "CASCADE", // Cascade delete on ApplyJob if Applicant is deleted
  onUpdate: "CASCADE", // Cascade update on ApplyJob if Applicant is updated
});
Job.belongsToMany(Applicant, {
  through: ApplyJob,
  foreignKey: "job_id",
  onDelete: "CASCADE", // Cascade delete on ApplyJob if Job is deleted
  onUpdate: "CASCADE", // Cascade update on ApplyJob if Job is updated
});

// Service and Employer Relationship (Many-to-One with Set Null on Delete)
Employer.belongsTo(Service, {
  foreignKey: "service_id",
  onDelete: "SET NULL", // Set service_id to NULL if Employer is deleted
  onUpdate: "CASCADE", // Cascade update on Employer if Service is updated
});
Service.hasMany(Employer, { foreignKey: "service_id" });

// Category and Skill Relationship (One-to-Many with Cascade Delete)
Category.hasMany(Skill, {
  foreignKey: "category_id",
  onDelete: "CASCADE", // Cascade delete on Skill if Category is deleted
  onUpdate: "CASCADE", // Cascade update on Skill if Category is updated
});
Skill.belongsTo(Category, {
  foreignKey: "category_id",
  onDelete: "CASCADE", // Cascade delete on Skill if Category is deleted
  onUpdate: "CASCADE", // Cascade update on Skill if Category is updated
});
// In your Employer model
module.exports = {
  sequelize,
  Role,
  User,
  Employer,
  Service,
  Applicant,
  Skill,
  Job,
  Category,
  Position,
  UserRole,
  ApplicantSkill,
  JobSkill,
  ApplyJob,
};
