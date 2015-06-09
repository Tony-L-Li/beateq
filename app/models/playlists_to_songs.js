var Sequelize = require("sequelize");

module.exports = function (app) {
  var sequelize = app.get('sequelize');

  var PlaylistsToSongs = sequelize.define('playlists_to_songs', {
    playlistId: {
      type: Sequelize.STRING
    },
    songOrder: {
      type: Sequelize.INTEGER
    },
    songId: {
      type: Sequelize.INTEGER
    }
  }, {
    freezeTableName: true
  });

  PlaylistsToSongs.sync();

  return PlaylistsToSongs;
};
