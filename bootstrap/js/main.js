$(window).load(function() {
	$('body').fadeIn('slow', function() {
    		// Animation complete
    	});
});
$( document ).ready(function(){


   // Initialize varibles
   var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $log = $('#consoleText'); // Log message 


  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  var socket = io();
  var Room ="world";
  var classRoom = "world";
  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

// Multiroom
// 



$('#register').on('click' , function(){
  $('#registerAction').toggle('fast');
  $('#registerForm').toggle('slow');
});
$('#registerClose').on('click' , function(){
  $('#registerForm').toggle('fast');
  $('#registerAction').toggle('slow');
});
$('#loginButton').on('click' , function(){
  $('#loginAction').toggle('fast');
  $('#loginForm').toggle('slow');
}),
$('#loginClose').on('click' , function(){
  $('#loginForm').toggle('fast');
  $('#loginAction').toggle('slow');
});

  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];



$('ul#onglet li').on('click', function(e){
      var id = $(this).attr('data-id');
      classRoom = id;
    });



  /*Commands line chat */
  function joinRoom(room){
  	//tell the server to join specific room
  	socket.emit('joinRoom', room);
  	Room = room;

    $('#onglet').append('<li role="presentation" class="'+room+'A" data-id="'+room+'"><a href="#'+room+'" role="tab" data-toggle="tab" aria-controls="'+ room +'">'+ room +'</a></li>');

    var tab = '<div role="tabpanel" class="tab-pane fade" id="' + room + '">';
    tab += ' <li class="chat page"><div class="chatArea"><ul class="messages ' + room + '"></ul></div>';
    tab += '</li></div>';
    $('#chatScreen').append(tab);

    $('ul#onglet li').on('click', function(e){
      var id = $(this).attr('data-id');
      classRoom = id;
      $messages = $('.' + classRoom);
    });
  }

  function leaveRoom (room) {
  	//tell the server to leave a specific room
  	socket.emit('leaveRoom' , room);
    $('#' + room).remove();
    $('.' + room + 'A').remove();

  }

//change user username
function nickName(name) {
 socket.emit('nickName' , name);
 username = name;
}

function listChan(string) {
 socket.emit('listChan' , string);
}

function listUsr()
{
  socket.emit('listUsr');
}

/* Send message to specified user */
function sendMessageTo(name)
{
  socket.emit('privateMsg', name);
}

function changeUsername (name) {
  log("Your name has change to : <kbd>" + name + '</kbd>', 'info');
}

/* display the help */
function displayHelp()
{
  var message = 'Here is the list of all availables commands in this fuckin chat';
  message += '<ul>';
  message += '<li><kbd>/nick_nickname</kbd> Allow you to change your name</li>';
  message += '<li><kbd>/list_ </kbd> List all fucking channels ( and private chan too )</li>';
  message += '<li><kbd>/join_channel</kbd> Join a specified channel, if that don\'t exist, create it</li>';
  message += '<li><kbd>/part_channel</kbd> Leave specified channel</li>';
  message += '<li><kbd>/users_</kbd> List all other nerdy redliner</li>';
  message += '<li><kbd>/msg_nickname</kbd> Send private message to specified user ( no dick pics ! )</li>';
  message += '<li><kbd>*Whatever you want*</kbd> Send message to the channel where you are</li>';
  message += '<ul>';
  log(message, 'ok');
}

/* Display a list of all room */
function displayList(data) {
  log('<kbd>Channel\'s List','info');
  for(var val of data.room) {
    log(val, 'info');
  }
}

/* Display alist of all users in all room */
function displayUser(data) {
  log('<kbd>Users online</kbd>', 'info');
  for(var val in data.data){
    log(val, 'info');
  }
}

function addParticipantsMessage (data) {
 var message = '';
 if (data.numUsers === 1) {
  message += "1 Redliner connected";
} else {
  message +=  data.numUsers + " Redliner connected";
}
log(message);
}

  // Sets the client's username
  function setUsername () {
  	username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
    	$loginPage.fadeOut();
    	$chatPage.show();
    	$loginPage.off('click');
    	$currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  function defineCommande(message) {
   var commande = "";
   var option = "";
   if(message.indexOf('_')){
    commande = message.substr(0 , message.indexOf('_'));
    option = message.substr(message.indexOf('_') + 1);

    switch(commande) {
     case '/join' :
     joinRoom(option);
     $inputMessage.val('');
     break;
     case '/part':
     leaveRoom(option);
     $inputMessage.val('');
     break;
     case '/nick' :
     nickName(option);
     $inputMessage.val('');
     break;
     case '/list' :
     listChan(option);
     $inputMessage.val('');
     break;
     case '/users' :
     listUsr();
     $inputMessage.val('');
     break;
     case '/msg' :
     sendMessageTo(option);
     $inputMessage.val('');
     break;
     case '/help' :
     displayHelp();
     $inputMessage.val('');
     break;
     case '/pangolin' : 
      easter('loop');
      $inputMessage.val('');
      break;
     default:
     $inputMessage.val('');
     log('not a valid command , type <kbd>/help_</kbd> for help or man google', 'error');
     break;
   }
 }
}

  // Sends a chat message
  function sendMessage () {
  	var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if(message[0] == '/'){
    	defineCommande(message);
    	return false;
    }
    if (message && connected) {
    	$inputMessage.val('');
    	addChatMessage({
    		username: username,
    		message: message
    	}, 'undefined', classRoom);
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', {room : classRoom , message : message});
    }
  }

  // Log a message
  // function log (message, options) {
  // 	var $el = $('<li>').addClass('log').html(message).fadeIn('slow');
  // 	addMessageElement($el, options);
  // }

  function log ( message, option ) {
    var color;
    switch(option){
      case 'error':
      color = "##e74c3c";
      break;
      case 'ok':
      color = '#2ecc71';
      break;
      case 'warning':
      color ='#e67e22'
      break;
      case 'info':
      color = '#9b59b6'
      break;
      default:
      color = '#ecf0f1';
      break;
    }
    var $el = $('<li style="color:'+color+'">').addClass('log2').html(message).fadeIn('slow');
    addLogElement($el);
  }



  // Adds the visual chat message to the message list
  function addChatMessage (data, options, classRoom) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
    	options.fade = false;
    	$typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
    .text(data.username)
    .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
    .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="messages ' + classRoom + '"/>')
    .data('username', data.username)
    .addClass(typingClass)
    .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
  	data.typing = true;
  	data.message = 'is typing';
  	addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
  	getTypingMessages(data).fadeOut(function () {
  		$(this).remove();
  	});
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
  	var $el = $(el);

    // Setup default options
    if (!options) {
    	options = {};
    }
    if (typeof options.fade === 'undefined') {
    	options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
    	options.prepend = false;
    }

    // Apply options
    if (options.fade) {
    	$el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
    	$messages.prepend($el);
    } else {
    	$messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  function addLogElement(el) {
    var $el = $(el);
    $log.append($el);
    $log[0].scrollTop = $log[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
  	return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
  	if (connected) {
  		if (!typing) {
  			typing = true;
  			socket.emit('typing');
  		}
  		lastTypingTime = (new Date()).getTime();

  		setTimeout(function () {
  			var typingTimer = (new Date()).getTime();
  			var timeDiff = typingTimer - lastTypingTime;
  			if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
  				socket.emit('stop typing');
  				typing = false;
  			}
  		}, TYPING_TIMER_LENGTH);
  	}
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
  	return $('.typing.message').filter(function (i) {
  		return $(this).data('username') === data.username;
  	});
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
    	hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    	$currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
    	if (username) {
    		sendMessage();
    		socket.emit('stop typing');
    		typing = false;
    	} else {
    		setUsername();
    	}
    }
  });

  $inputMessage.on('input', function() {
  	updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
  	$currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
  	$inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
  	connected = true;
    // Display the welcome message
    var message = "Welcome to Redline Irc , Enjoy your taste; ";
    log(message, 'ok');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
  	addChatMessage(data, 'undefined', classRoom);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
  	log(data.username + ' joined', 'info');
  	addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
  	log(data.username + ' left', 'info');
  	addParticipantsMessage(data);
  	removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
  	addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
  	removeChatTyping(data);
  });

//Chenever the server emits 'chanList' , show the list of chan
socket.on('chanList' , function(data) {
 displayList(data);
});

socket.on('userList', function(data) {
  displayUser(data);
  console.log(data);
});

socket.on('msgJoin', function(room) {
  log('<kbd>You join the chan : </kbd><kbd>' + room + '</kbd>');
});
socket.on('msgPart', function(room) {
  log('<kbd>You leave the chan : </kbd><kbd>' + room + '</kbd>');
});

socket.on('sendMsgTo', function(name){
  alert('Private message from ' + name + ' is like devil spam');
    // sendMsgTo(name);
  });

socket.on('newUsername', function(data) {
  changeUsername(data.data);
});

});