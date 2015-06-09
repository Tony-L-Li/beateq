$(function () {
  $('.duration-slider').slider({
    range: 'min',
    value: 37,
    min: 1,
    max: 100,
  });

  $.ajax({
    type: 'GET',
    url: window.location.href + '/songs',
    data: {
      songId: 1234567
    },
    success: function (data) {
      console.log(data);
    },
    dataType: 'json'
  });

  var longPoll = function () {
    $.ajax({
      method: 'GET',
      url: window.location.href + '/subscribe',
      success: function (data) {
        console.log(data);
      },
      complete: function () {
        longPoll()
      },
      timeout: 30000
    })
  };
  longPoll();

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
