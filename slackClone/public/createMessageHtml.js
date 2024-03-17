const createNewMessage = (messageObj) => `
    <li>
        <div class="user-image">
            <img src=${messageObj.avatar} />
        </div>
        <div class="user-message">
            <div class="user-name-time">${messageObj.username} <span>${new Date(messageObj.date).getHours()}:${new Date(messageObj.date).getMinutes()}</span></div>
            <div class="message-text">${messageObj.message}</div>
        </div>
    </li>
`