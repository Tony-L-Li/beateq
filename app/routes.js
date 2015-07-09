module.exports = function (app) {
  var _ = require('lodash');
  var EventEmitter = require('events').EventEmitter;
  var messageBus = new EventEmitter();
  messageBus.setMaxListeners(500);

  var User = require('./models/user')(app);
  var Playlist = require('./models/playlist')(app);
  var PlaylistsToSongs = require('./models/playlists_to_songs')(app);

  app.post('/p/:pId/addsong', function (req, res) {
    PlaylistsToSongs.findAndCountAll({
      where: {
        playlistid: req.params.pId,
        songid: req.body.songId
      }
    }).then(function (result) {
      if (result.count === 0) {
        PlaylistsToSongs.max('songorder', {
          where: {
            playlistid: req.params.pId
          }
        }).then(function (max) {
          PlaylistsToSongs.create({
            playlistid: req.params.pId,
            songorder: (isNaN(max) ? 1 : max + 1),
            songid: req.body.songId
          }).then(function (newPlaylist) {
            messageBus.emit(req.params.pId, ['add', req.body.songId]);
            res.sendStatus(200).end();
          });
        });
      } else {
        res.sendStatus(400).end();
      }
    });
  });

  app.post('/p/:pId/deletesong', function (req, res) {
    PlaylistsToSongs.destroy({
      where: {
        playlistid: req.params.pId,
        songid: req.body.songId
      }
    }).then(function () {
      messageBus.emit(req.params.pId, ['destroy', req.body.songId]);
      res.sendStatus(200).end();
    }).catch(function (error) {
      res.sendStatus(400).end();
    });
  });

  app.post('*create', function (req, res) {
    var createPlaylist = function () {
      var curRand = Math.random().toString(36).substr(2, 5);
      Playlist.count({
        where: {
          id: curRand
        }
      }).then(function (count) {
        if (count === 0) {
          Playlist.create({
            id: curRand,
            name: req.body.name
          });
          res.json({
            url: curRand
          });
        } else {
          createPlaylist();
        }
      });
    };

    createPlaylist();
  });

  app.get('/p/:pId/subscribe', function (req, res) {
    var listener = function (data) {
      res.json(data);
    };

    messageBus.once(req.params.pId, listener);

    req.on('close', function () {
      messageBus.removeListener(req.params.pId, listener);
    });
  });

  app.get('/p/:pId/name', function (req, res) {
    Playlist.findAll({
      where: {
        id: req.params.pId
      }
    }).then(function (playlists) {
      res.json(playlists[0].dataValues.name);;
    });
  });

  app.get('/p/:pId/songs', function (req, res) {
    PlaylistsToSongs.findAll({
      where: {
        playlistid: req.params.pId
      },
      order: 'songorder'
    }).then(function (songs) {
      res.json(_.map(songs, function (song) {
        return song.dataValues;
      }));
    });
  });

  app.get('*playlists', function (req, res) {
    Playlist.findAll({
      limit: 8
    }).then(function (playlists) {
      res.json(_.map(playlists, function (playlist) {
        return playlist.dataValues;
      }));
    })
  });

  app.get('/', function (req, res) {
    res.sendfile('./client/views/index.html');
  });

  app.get('/p/:pId', function (req, res) {
    Playlist.count({
      where: {
        id: req.params.pId
      }
    }).then(function (count) {
      if (count === 0) {
        res.sendfile('./client/views/null_playlist.html');
      } else {
        res.sendfile('./client/views/playlist.html');
      }
    });
  });
};
