var socket = io();

var newNick = window.prompt('Enter your Nickname');
newNick = newNick ? newNick : "Annonymous";
socket.nickName = newNick;

socket.emit('nick_change', {'old_nick' : "", 'new_nick' : socket.nickName});

$('form').submit(function(){
  socket.emit('chat_message', {'msg' : $('#mssgText').val(), 'user' : socket.nickName});

  $('#mssgText').val('');
  return false;
});


//change Nick
$("#changeNick").click(function(){
    $("#myModal").modal();
});

$("#setNick").click(function(){
    if($('#newNick').val().length > 0) {
      var oldNick = socket.nickName || socket.id;
      socket.nickName = $('#nickName').val();
      $('#nickName').val('');
      socket.emit('nick_change', {'old_nick' : oldNick, 'new_nick' : socket.nickName});
    }
});

socket.on('nick_change', function(data) {
  $('#messages').append($('<li>').text("New Nickname : " + data.old_nick + " --> " + data.new_nick));
})

//Socket.io functions
socket.on('chat_message', function(data){
  $('#messages').append($('<li>').text(data.user + " : " + data.msg));
});

socket.on('user_left', function(data) {
  console.log(data);
  $('#messages').append($('<li>').text(data.user + " has left the chat!!"));
})

socket.on('new_user', function(data) {
  $('#messages').append($('<li>').text(data["new_nick"] + " has joined the chat."));
})
