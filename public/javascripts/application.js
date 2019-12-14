

$(function() {
  $('.need-confirm-btn').click(function() {
    if (confirm('Are you sure to delete?')) {
      return true;
    }
    return false;
  });

  $("#personnel").change(function(){
    var price = parseInt($(".price").text(), 10);
    var personnel = parseInt($("#personnel").val(), 10);
    if (!isNaN(price) && !isNaN(personnel) ) {
      var totalPrice = price * personnel;
      $("#totalPrice").val(totalPrice);
    }
  });

  $('.datepicker').datepicker({
    uiLibrary: 'bootstrap4', 
    disableDates:  function (date) {
        const currentDate = new Date();
        return date > currentDate ? true : false;
     }
    
  });    

  var $star_rating = $('.star-rating .fa');
  
  var SetRatingStar = function() {
    return $star_rating.each(function() {
      if (parseInt($star_rating.siblings('input.rating-value').val()) >= parseInt($(this).data('rating'))) {
        return $(this).removeClass('fa-star-o').addClass('fa-star');
      } else {
        return $(this).removeClass('fa-star').addClass('fa-star-o');
      }
    });
  };
  
  $star_rating.on('click', function() {
    $star_rating.siblings('input.rating-value').val($(this).data('rating'));
    return SetRatingStar();
  });
  
  SetRatingStar();
  $(document).ready(function() {
  
  });




});
