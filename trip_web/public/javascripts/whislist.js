$(function(){
  $('.product-whislist-btn').click(function(e) {
    var $el = $(e.currentTarget);
    if ($el.hasClass('loading')) return;
    $el.addClass('loading');
    $.ajax({
      url: '/ajax/products/' + $el.data('id') + '/like',
      method: 'POST',
      dataType: 'json',
      success: function(data){
        $('.products .num-likes').text(data.numLikes);
        $('.product-whislist-btn').hide();
      },
      error: function(data, status) {
        if (data.status == 401) {
          alert('Login required!');
          location = '/signin';
        }
        console.log(data, status);
      },
      complete: function(data) {
        $el.removeClass('loading');
      }
    });
  });
  
});