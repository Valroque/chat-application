if(window.location.pathname == '/register') {

  $('div .loginBar').addClass('hide');
  $('div .registrationForm').removeClass('hide');

} else if(window.location.pathname == '/login') {

  $('div .loginBar').removeClass('hide');
  $('div .registrationForm').addClass('hide');
  
}
