$(function () {
  $('.create-button').click(function () {
    if ($('.name-input').css('display') === 'inline-block' && $('.name-input').val().length != 0) {
      $.ajax({
        type: 'POST',
        url: window.location.href + '/create',
        data: {
          name: $('.name-input').val().replace(/\s+/g, '')
        },
        dataType: 'json',
        success: function (data) {
          window.location.href = window.location.href + 'p/' + data.url
        }
      });
    } else {
      $(".name-input").animate({
        width: 'toggle'
      }, 200).focus();
    }
  });
});
