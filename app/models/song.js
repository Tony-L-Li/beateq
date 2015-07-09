var Sequelize = require("sequelize");

module.exports = function (app) {
  var sequelize = app.get('sequelize');

  var Song = sequelize.define('song', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    songid: {
      type: Sequelize.INTEGER
    }
  }, {
    freezeTableName: true
  });

  Song.sync();

  return Song;
};
