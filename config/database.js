const { Sequelize } = require("sequelize");
const config = require("./config.json"); // Đường dẫn đến tệp config.json

// Lấy môi trường hiện tại (development, test, production)
const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Tạo kết nối Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
  }
);

// Kiểm tra kết nối
sequelize
  .authenticate()
  .then(() => {
    console.log("Kết nối đến cơ sở dữ liệu thành công.");
  })
  .catch((err) => {
    console.error("Không thể kết nối đến cơ sở dữ liệu:", err);
  });

module.exports = sequelize;
