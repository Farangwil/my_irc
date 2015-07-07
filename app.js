// Setup basic express server
var port = 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(port, function () {
	console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname));

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
	var addedUser = false;

  //user can join /unjoin specific room
  socket.on('joinRoom' , function(room){
    socket.emit('msgJoin', room);
  	socket.join(room);
  });
  socket.on('leaveRoom' , function(room){
    socket.emit('msgPart', room);
  	socket.leave(room);
  });

  //user can change username
  socket.on('nickName' , function(name){
  	delete socket.username;
  	socket.username = name;
    socket.emit('newUsername', {
      data: name
    });
  	// console.log(socket.username);
  });

  //list all channels or channel contain string
  socket.on('listChan' , function(string){
  	socket.emit('chanList', {
  		room: getRooms(io.sockets.adapter.rooms)
  	});
  	
  });

  //list all users on current room
  socket.on('listUsr', function(){
    socket.emit('userList', {data:usernames});
  });

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    console.log(data);
    // we tell the client to execute 'new message'
    socket.in(data.room).emit('new message', {
    	username: socket.username,
    	message: data.message
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.join('world');
    socket.emit('login', {
    	numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
    	username: socket.username,
    	numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
  	socket.in('world').emit('typing', {
  		username: socket.username
  	});
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
  	socket.in('world').emit('stop typing', {
  		username: socket.username
  	});
  });

  socket.on('room', function(data){
    socket.room = data;
    alert(socket.room);
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function (reason) {
    console.log('Client disconnected => ' + reason);
    // remove the username from global usernames list
    if (addedUser) {
    	delete usernames[socket.username];
    	--numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
      	username: socket.username,
      	numUsers: numUsers
      });
    }
  });

  socket.on('privateMsg', function(name){
    // io.to(name).emit('')
    socket.emit('sendMsgTo', name);
  });
});


// get room in parameters, remove cookie and return only all user's created rooms
function getRooms(rooms) {
  var availableRooms = [];
    if (rooms) {
        for (var room in rooms) {
            if (!rooms[room].hasOwnProperty(room)) {
                availableRooms.push(room);
            }
        }
    }
    console.log(rooms);
    return availableRooms;
}

//@TODO Send Msg to specific user
//Front : Create physic room (onglet)
//logic join \ leave room