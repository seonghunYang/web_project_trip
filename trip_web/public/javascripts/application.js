

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
    uiLibrary: 'bootstrap4'
  });    
});
