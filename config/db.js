const mysql = require('mysql2');
require("dotenv").config();
const connection = mysql.createPool({
  host: "mysql.hostinger.com",
  user: "u867012074_mpsac",
  password: "mercyGwapa101",
  database: "u867012074_mpsac"
});



module.exports = connection.promise();