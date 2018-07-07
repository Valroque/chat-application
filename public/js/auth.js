$(document).ready(function() {

  $("#register").click(function(event) {
    event.preventDefault();

    if( $('#passwordReg').val().trim() == $('#repasswordReg').val().trim() ) {
        if( $('#userNameReg').val().trim().length >= 8 && $('#passwordReg').val().trim().length >= 8 ) {
          $.ajax({
            type : 'POST',
            url : '/auth/register',
            data : {
              userName : $('#userNameReg').val().trim(),
              password : $('#passwordReg').val().trim()
            },
            success : function(data) {
              if(data.status == 1) {
                window.location = window.location.origin;
              } else if(data.staus == 0) {
                $('#notificationReg').text(data.message);
              }
            }
          })
        } else {
          $('#notificationReg').text('UserID and Password length has to be greater than 8');
        }
    } else {
      $('#notificationReg').text('Passwords Do Not Match!!');
    }
  })

  $("#login").click(function(event) {
    event.preventDefault();

    $.ajax({
      type : 'POST',
      url : '/auth/login',
      data : {
        userName : $('#userNameLogin').val().trim(),
        password : $('#passwordLogin').val().trim()
      },
      success : function(data) {
        if(data.status == 1) {
          window.location.reload();
        } else if(data.status == 0) {
          alert(data.message);
        }
      }
    })

  })

})
