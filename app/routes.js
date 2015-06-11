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
        playlistId: req.params.pId,
        songId: req.body.songId
      }
    }).then(function (result) {
      if (result.count === 0) {
        PlaylistsToSongs.max('songOrder', {
          where: {
            playlistId: req.params.pId
          }
        }).then(function (max) {
          PlaylistsToSongs.create({
            playlistId: req.params.pId,
            songOrder: (isNaN(max) ? 1 : max + 1),
            songId: req.body.songId
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
        playlistId: req.params.pId,
        songId: req.body.songId
      }
    }).then(function () {
      messageBus.emit(req.params.pId, ['destroy', req.body.songId]);
      res.sendStatus(200).end();
    }).catch(function (error) {
      res.sendStatus(400).end();
    });
  });

  app.post('*create', function (req, res) {
    console.log(req.body.name);
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
      })
    };

    createPlaylist();
  });

  app.get('/p/:pId/subscribe', function (req, res) {
    var addMessageListener = function (res) {
      messageBus.once(req.params.pId, function (data) {
        res.json(data);
      });
    };
    addMessageListener(res);
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
        playlistId: req.params.pId
      },
      order: 'songOrder'
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
    res.sendfile('./client/index.html');
  });

  app.get('/p/*', function (req, res) {
    res.sendfile('./client/views/main.html');
  });
};
