const joinRoom = async (roomTitle, namespaceId) => {
    console.log(roomTitle, namespaceId);

    const ackResp = await namespaceSockets[namespaceId].emitWithAck('joinRoom', { roomTitle, namespaceId });
    
        document.querySelector('.curr-room-num-users').innerHTML = `${ackResp.numUsers} <span class="fa-solid fa-user"></span>`;
        document.querySelector('.curr-room-text').innerHTML = roomTitle;
        const history = ackResp.thisRoomHistory;
        console.log(history);
        document.querySelector('#messages').innerHTML = "";
        history.forEach(messageObj => {
            document.querySelector('#messages').innerHTML += createNewMessage(messageObj);
        })
}