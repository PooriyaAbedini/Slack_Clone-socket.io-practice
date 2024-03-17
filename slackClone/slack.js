const express = require('express');
const socketio = require('socket.io');
require('dotenv').config();
const port = process.env.PORT || 8000;
const namespaces = require('./Data/namespaces');
const colors = require('colors');
const Room = require('./classes/Room');

const app = express();

// console.log("READ ABOUT THE SOCKET.IO HANDSHACK. IT'S VERY USEFULL FOR AUTH AND FETCHING DATA USING QUERYS!!!".red)

app.use(express.static(__dirname + '/public'))

const expressServer = app.listen(port, () => {
  	console.log(`Server is running on port: ${port}`.cyan);
});

const io = socketio(expressServer);

// app.set('io', io);

//Manufactured way for changing a ns without creating a huge UI!
app.get('/change-ns', (req, res) => {
	namespaces[0].addRoom(new Room(0, 'Deleted articles', 0));

  // if i don't want to my express routes mingled with my io files i should do this (line 29), ofcoure after i set the 'io' to io
  //after defining io, like i did in the comment in line 21.
  //const io = app.get('io'); 
  io.of(namespaces[0].endpoint).emit('nsChange', namespaces[0]);
  res.json('namespace[0] has changed!')
})

io.on('connection', (socket) => {

  socket.emit('welcome', {data: "Welcome to this socket.io server!"});

	socket.on('clientConnect', (data) => {
		console.log(`${socket.id}`.cyan, `has connected!!`);
		socket.emit('nsList', namespaces);
	})

});

namespaces.forEach(ns => {
	io.of(ns.endpoint).on('connection', (socket) => {

		// console.log(`${socket.id} has connected to namespace: ${ns.endpoint}`.underline.cyan);
		socket.on('joinRoom', async (roomData, ackCallback) => {
			//Fetching rooms history
			const thisNs = namespaces[roomData.namespaceId];
			const thisRoom = thisNs.rooms.find(room => room.roomTitle === roomData.roomTitle);
			const thisRoomHistory = thisRoom.history;
			
			//Befor joining a room usre should leave all rooms (EXCEPT PERSONAL ROOM), because a user can be only in 1 room at a time
			const rooms = socket.rooms;
			let i = 0;
			rooms.forEach(room => {
				if(i !== 0) {
					socket.leave(room);
				}
				i++;
			});
			//Join the room.
			//NOTE: room titles are comming from browser and it's not safe!
			//Some kind of AUTH should be there...!
			socket.join(roomData.roomTitle);
			const sockets = await io.of(ns.endpoint).in(roomData.roomTitle).fetchSockets();
			ackCallback({
				numUsers: sockets.length,
				thisRoomHistory,
			});
		})
		socket.on('newMessageToRoom', messageObj => {
			//Sending messageObj to all the clients that are in this room;
			const rooms = socket.rooms;
			const currentRoom = [...rooms][1];
			io.of(ns.endpoint).in(currentRoom).emit('messageToRoom', messageObj);
			//Adding this message to this rooms history:
			const thisNs = namespaces[messageObj.selectedNsId];
			const thisRoom = thisNs.rooms.find(room => room.roomTitle === currentRoom);
			thisRoom.addHistory(messageObj);
		})
	});
})