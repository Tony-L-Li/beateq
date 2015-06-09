var Sequelize = require("sequelize");

module.exports = function (app) {
  var sequelize = app.get('sequelize');

  var Playlist = sequelize.define('playlist', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      validate: {
        isAlphanumeric: true
      }
    }
  }, {
    freezeTableName: true
  });

  Playlist.sync();

  return Playlist;
};
