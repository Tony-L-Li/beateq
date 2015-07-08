var Sequelize = require("sequelize");

module.exports = function (app) {
  var sequelize = app.get('sequelize');

  var PlaylistsToSongs = sequelize.define('playlists_to_songs', {
    playlistid: {
      type: Sequelize.STRING
    },
    songorder: {
      type: Sequelize.INTEGER
    },
    songid: {
      type: Sequelize.INTEGER
    }
  }, {
    freezeTableName: true
  });

  PlaylistsToSongs.sync({
    force: true
  });

  return PlaylistsToSongs;
};
