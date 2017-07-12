//  ***********************************
// Imports
//  ***********************************
const express = require('express')
const path = require('path')
var app = express();
app.use(express.static(path.join(__dirname, '..', 'build')))
const port = process.env.PORT || 3001;

app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, '..','build', 'index.html'));
});

const server = app.listen(port)
var io = require('socket.io')(server);
const GameState = require('./gameFunctions/gameState')
const state = new GameState();

// ***********************************
// Socket logic and connections
// ***********************************

var connections = [];

//    ---Logging connections, and adding socket to connections array
io.on('connection', function (socket) {
  console.log("Connection established")
	connections.push(socket)

	socket.on('joinGame', function(mouse){
		 console.log("joined game")
     state.addPlayer(socket.id)
     state.updateMousePos(mouse)
     io.emit('addPlayer', state.getPlayer(socket.id));
   })



	 socket.on('disconnect', function(player){
		 console.log("disconnected", player)

	 });

		socket.on('leaveGame', (playerId) => {
			socket.emit('removePlayer', state.getPlayer(playerId))
			socket.broadcast.emit('removePlayer', state.getPlayer(playerId))
			state.removePlayer(playerId)
      state.removeMousePos(playerId)

		})

    socket.on("mouseMove", (mouseData) => {
      state.updateMousePos(mouseData)
      console.log('cheese', mouseData)
      state.updatePlayer(mouseData.id)
    })

	socket.on('shoot', (laser) => {
     var laser = new Laser(laser.id, laser.xStart, laser.yStart, laser.xEnd, laser.yEnd);
     gameServer.addLaser(laser)
   })

//		---Listens for sync emit
//		---gameData is an object with arrays for values

	socket.emit("firstupdate", state.toJS())
	setInterval(()=>io.emit('update', state.toJS()), 1000)

	socket.on('sync', (gameData) => {

	})

});
