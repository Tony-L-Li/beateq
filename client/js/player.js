$(function () {
  var songQueue = [];
  var curSongIndex = null;
  var curSong = null;
  var durationSlider = $('.duration-slider');
  var isSliding = false;

  SC.initialize({
    client_id: '7b56e7d11d264d0f34c0358846603a8f'
  });

  function playSong(songId) {
    SC.stream("/tracks/" + songId, function (sound) {
      if (curSong) curSong.stop();
      curSong = sound;
      curSongIndex = songQueue.indexOf(parseInt(songId, 10));
      var songInfo = $('.playlist-scroll > .song-item:eq(' + curSongIndex + ')');

      $('.song-item').removeClass('active');
      songInfo.addClass('active');

      if ($('.play').hasClass('fa-play')) {
        $('.play').removeClass('fa-play').addClass('fa-pause');
      }

      $('.playing-info > .album-art').attr('src', songInfo.children('img')[0].attributes[0].value);
      $('.playing-info > .playing-des > .current-title').text(songInfo.find('p:eq(0)')[0].innerText);
      $('.playing-info > .playing-des > .current-artist').text(songInfo.find('p:eq(1)')[0].innerText);
      curSong.play();

      console.log(curSong);
    });
  }

  function getSongs(searchStr, callback) {
    SC.get('/tracks', {
      q: searchStr,
      limit: 50
    }, function (tracks) {
      callback(tracks);
    });
  }

  function refreshSongResults(tracks) {
    _(tracks).forEach(function (n) {
      /*
      $('.search-container').append(
        $('<div>', {
          id: n.id,
          addClass: 'search-song-item',
          append: $('<img>', {
            attr: {
              src: n.artwork_url || '/../img/art_default.jpg',
              alt: 'album art',
              addClass: 'album-art'
            }
          }).add($('<div>', {
            addClass: 'des',
            append: $('<p>')
          }))
        })*/
      $('.search-container').append('<div class="search-song-item" id="' + n.id + '">\
            <img src="' + (n.artwork_url || '/../img/art_default.jpg') + '" alt="album art" class="album-art">\
            <div class="des">\
              <p class="title">' + n.title + '</p>\
              <p class="artist">' + n.user.username + '</p>\
            </div>\
          </div>');
    }).value();
  }

  durationSlider.slider({
    range: 'min',
    value: 0,
    min: 1,
    max: 100,
    start: function () {
      isSliding = true;
    },
    stop: function (event, ui) {
      curSong.seek(ui.value * 0.01 * curSong.getDuration());
      isSliding = false;
    }
  });

  setInterval(function () {
    function timeFromMs(num) {
      function twoDigits(num) {
        return ('0' + num).slice(-2);
      }

      return twoDigits(Math.floor(num / (60 * 1000))) + ':' +
        twoDigits(Math.floor(num / 1000) % 60);
    }

    if (curSong) {
      var duration = curSong.getDuration();
      var curPos = curSong.getCurrentPosition();

      $('.time').text(timeFromMs(curPos) + ' / ' + timeFromMs(duration));
      if (!isSliding) {
        durationSlider.slider('value', curSong.getCurrentPosition() * 100 / curSong.getDuration());
      }
    }
  }, 300);

  $('.backward').click(function () {
    if (songQueue.length === 0) return;

    if (curSongIndex != null) {
      curSongIndex = (curSongIndex + (songQueue.length - 1)) % songQueue.length;
      playSong(songQueue[curSongIndex]);
    } else {
      playSong(songQueue[curSongIndex = 0]);
    }
  });

  $('.forward').click(function () {
    if (songQueue.length === 0) return;

    if (curSongIndex != null) {
      curSongIndex = (curSongIndex + 1) % songQueue.length;

      playSong(songQueue[curSongIndex]);
    } else {
      playSong(songQueue[curSongIndex = 0]);
    }
  });

  $('.play').click(function () {
    if ($(this).hasClass('fa-play')) {
      $(this).removeClass('fa-play').addClass('fa-pause');
      curSong.play();
    } else {
      $(this).removeClass('fa-pause').addClass('fa-play');
      curSong.pause();
    }
  });

  $('.search-input').keyup(function (e) {
    if (e.keyCode == 13) {
      getSongs($(".search-input").val(), function (tracks) {
        refreshSongResults(tracks);
      });
    }
  });

  $('.search-button').click(function () {
    getSongs($(".search-input").val(), function (tracks) {
      refreshSongResults(tracks);
    });
  });

  $('.search-container').on('click', '.search-song-item', function () {
    addSongToServer(parseInt($(this).attr('id')));
  });

  $('.playlist-scroll').on('click', '.song-item > .close', function (e) {
    e.stopPropagation();
    deleteSongFromServer(parseInt($(this).parent().attr('id')));
  });

  $('.playlist-scroll').on('click', '.song-item', function () {
    playSong($(this).attr('id'));
  });

  function addSongToServer(songId) {
    $.ajax({
      type: 'POST',
      url: window.location.href + '/addsong',
      data: {
        songId: songId
      },
      dataType: 'json'
    });
  }

  function deleteSongFromServer(songId) {
    $.ajax({
      type: 'POST',
      url: window.location.href + '/deletesong',
      data: {
        songId: songId
      },
      dataType: 'json'
    });
  }

  function addSongsToClient(songIds) {
    if (songIds.length === 0) return;

    var callback = function (track) {
      $('.playlist-scroll').append('<div class="song-item ' + (songQueue.length === 0 ? "active" : "") + '" id="' + track.id + '">\
                <img src="' + (track.artwork_url || '/../img/art_default.jpg') + '" alt="album art" class="album-art">\
                <div class="des">\
                  <p class="title">' + track.title + '</p>\
                  <p class="artist">' + track.user.username + '</p>\
                </div>\
                <i class="fa fa-close close"></i>\
              </div>');
      songQueue.push(parseInt(songIds[0]));

      if (songQueue.length === 1) {
        playSong(songIds[0]);
      }

      if (songIds.length > 1) addSongsToClient(songIds.slice(1));
    };

    SC.get('/tracks/' + songIds[0], function (track) {
      callback(track);
    });
  }

  function deleteSongFromClient(songId) {
    var deleteIndex = songQueue.indexOf(parseInt(songId, 10));

    $('.playlist-scroll > .song-item:eq(' + deleteIndex + ')').remove();
    songQueue.splice(deleteIndex, 1);
  }

  var subscribe = function () {
    $.ajax({
      method: 'GET',
      url: window.location.href + '/subscribe',
      success: function (data) {
        if (data[0] === 'add') {
          addSongsToClient([data[1]]);
        } else {
          deleteSongFromClient(data[1]);
        }
      },
      complete: function () {
        subscribe()
      },
      timeout: 30000
    });
  };

  $.ajax({
    method: 'GET',
    url: window.location.href + '/songs',
    success: function (data) {
      addSongsToClient(_.map(data, function (n) {
        return n.songId;
      }));

      //starts longpolling after songs are loaded
      subscribe();
    }
  });

  /*
  $('.volume-slider').slider({
    orientation: 'vertical',
    range: 'min',
    value: 37,
    min: 1,
    max: 100,
  });
*/
});
