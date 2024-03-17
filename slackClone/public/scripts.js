
// const username = prompt('What is your username?');
// const password = prompt('What is your password?');

// Temp remove prompts to prevent headaches!
const username = 'Pooryia';
const password = '12346'

//always join the main namespace, because that's where the user joins the other namespaces
const socket = io('http://localhost:8000');

//Sockets will put here in the index of their ns.id.
//I'm using this method inorder to prevent the unnecessary terafic, every time that server restarts or reconnection happens.
const namespaceSockets = [];

const listeners = {
  nsChange: [],
  messageToRoom: [],
}
//A global variable for tracking, in which ns the user is sending the message;
let selectedNsId = 0;

document.querySelector('#message-form').addEventListener('submit', e => {
  e.preventDefault();
  const newMessage = document.querySelector('#user-message').value;
  namespaceSockets[selectedNsId].emit('newMessageToRoom', {
    username,
    avatar: 'https://via.placeholder.com/30',
    message: newMessage,
    date: Date.now(), 
    selectedNsId,
  });
  document.querySelector('#message-form').reset();
})

//addListeners job is to manage all listeners and prevent a listener from
//being added multiple times'
const addListener = (nsId) => {
  if(!listeners.nsChange[nsId]) {
    namespaceSockets[nsId].on('nsChange', data => {
      console.log('Ns changed!');
    })
    listeners.nsChange[nsId] = true;
  }
  if(!listeners.messageToRoom[nsId]) {
    namespaceSockets[nsId].on('messageToRoom', messageObj => {
      document.querySelector('#messages').innerHTML += createNewMessage(messageObj);
    });
    listeners.messageToRoom[nsId] = true;
  }  
}

socket.on('connect', () => {
  console.log(`connected with this id: ${socket.id}`);
  socket.emit('clientConnect');
});

socket.on('welcome', (message) => {
  console.log(message.data);
});

socket.on('nsList', (nsData) => {
  // console.log(nsData);
  
  const namespacesDiv = document.querySelector('.namespaces');
  namespacesDiv.innerHTML = "";

  nsData.forEach(ns => {
    namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint} rooms=${ns.rooms}><img src=${ns.image}></div>`

    //initializing thisNs as it's index in namespaceSockets array:
    //if the connection is new it will be null.
    //if the connection is already established, it'll be reconnect and stay in its spot.
    let thisNs = namespaceSockets[ns.id];

    if(!namespaceSockets[ns.id]) {
      //there is no connection on this id, so create a new connection!
      //joining this namespace using io()
      thisNs = io(`http://localhost:8000${ns.endpoint}`);
      namespaceSockets[ns.id] = thisNs;
    }
    
    addListener(ns.id);

  });

  const namespaceElements = Array.from(document.getElementsByClassName('namespace'));

  namespaceElements.forEach(element => {
    element.addEventListener('click', () => {
      joinNs(element, nsData)
    })
  })

  joinNs(document.getElementsByClassName('namespace')[0], nsData);
})

