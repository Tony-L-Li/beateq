$(function () {
  $('.create-button').click(function () {
    $(".name-input").animate({
      width: 'toggle'
    }, 200).focus();
  });
});