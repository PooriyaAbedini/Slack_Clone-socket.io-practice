// We can ask the server for new info on this NS. and it's BAD!
// We have a socket.io/ws, and server will tell us if something has happend! (correct way!) 
const joinNs = (element, nsData) => {
	const endpoint = element.getAttribute('ns');
	const clickedEndpoint = nsData.find(ns => ns.endpoint === endpoint);
	//variable we defined in scripts.js, in order to tracking that in which ns the user is sending the message:)
	selectedNsId = clickedEndpoint.id;
	const rooms = clickedEndpoint.rooms;
	let roomsUl = document.querySelector('.room-list');
	roomsUl.innerHTML = "";

	//Joining the first room
	let firstRoom;
	let firstRoomNamespaceId;
  	rooms.forEach((room, i) => {
		if(i === 0) {
			firstRoom = room.roomTitle;
			firstRoomNamespaceId = room.namespaceId;
		}
		roomsUl.innerHTML += 
		`<li class="room" namespaceId=${room.namespaceId}>
			<span class="fa-solid fa-${room.privateRoom ? 'lock' : 'globe'}"></span>${room.roomTitle}
		</li>`; 
	});
	joinRoom(firstRoom, clickedEndpoint.id);

	//Adding click listener to our rooms
	const roomNodes = document.querySelectorAll('.room');
	Array.from(roomNodes).forEach( elem => {
	elem.addEventListener('click', e => {
		// console.log("someone clicked the text: ", e.target.innerText);
		const namespaceId = elem.getAttribute('namespaceId');
		joinRoom(e.target.innerText, namespaceId)
	})
	})
}
