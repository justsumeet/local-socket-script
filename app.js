const express = require('express');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var os = require('os');
var hostname = os.hostname();

var server = app.listen(8080, () => {
  console.log('Server is running on port number 3000');
});

//Chat Server

var io = socketio.listen(server);

var connectedUserName = null;

io.on('connection', function (socket) {
  console.log(`Connection : SocketId = ${socket.id}`);

  if (!connectedUserName) {
    //Check Available
    socket.emit('available', { pcName: hostname });
  }

  socket.on('login', function (username) {
    console.log(`Login : UserName = ${username}`);
    if (!connectedUserName) {
      //Check Available
      // we store the username in the socket session for this client
      socket.username = username;
      connectedUserName = username;

      socket.emit('login');
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', { userId: username });
    } else {
      if (connectedUserName.localeCompare(username) != 0) {
        socket.emit('unavailable', { isLogin: true });
      }
    }
  });

  socket.on('is available', function (data) {
    if (!connectedUserName) {
      //Check Available
      socket.emit('available', { pcName: hostname });
    } else {
      socket.emit('unavailable', { isLogin: false });
    }
  });

  socket.on('ping pong', function (username) {
    console.log(`Ping Pong : UserName = ${username}`);
    if (connectedUserName && connectedUserName.localeCompare(username) == 0) {
      socket.emit('ping pong');
    }
  });

  socket.on('logout', function (username) {
    console.log(`Logout : UserName = ${username}`);
    if (connectedUserName && connectedUserName.localeCompare(username) == 0) {
      connectedUserName = null;
      // echo globally that this client has left
      socket.broadcast.emit('user left');
    }
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    console.log(`Disconnect : SocketId = ${socket.id}`);
    if (
      connectedUserName &&
      connectedUserName.localeCompare(socket.username) == 0
    ) {
      connectedUserName = null;
      // echo globally that this client has left
      socket.broadcast.emit('user left');
    }
  });
});

module.exports = server; //Exporting for test
