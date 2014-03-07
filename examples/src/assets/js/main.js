$(document).ready(function(){
  // ensure our example code is always using the most recent source.
  $('#source_code').each(function(x,i){
    $('#code').text($(i).html());
  });
})