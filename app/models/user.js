var Sequelize = require("sequelize");

module.exports = function (app) {
  var sequelize = app.get('sequelize');

  var User = sequelize.define('user', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING
    }
  }, {
    freezeTableName: true
  });

  User.sync({
    force: true
  });

  return User;
};
