const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//Get username and room from URL
const{username, room}= Qs.parse(location.search, {
    ignoreQueryPrefix: true
})
console.log(username, room)

const socket = io()

//join chatroom
socket.emit('joinRoom', {username, room})

//Get room and users
socket.on('roomUsers', ({room, users})=>{
    outputRoomName(room)
    outputUsers(users)
})

//Message to the server
socket.on('message', message =>{
    console.log(message)
    outputMessage(message)

    //For automatic scroll down
    chatMessages.scrollTop =chatMessages.scrollHeight
})

//Things that happen after entering submit button
chatForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    // Gets the user input message
    const msg = e.target.elements.msg.value

    // Emit the message tot the server
    socket.emit('chatMessage',msg)

    //To clear the input text field after submittimg message
    e.target.elements.msg.value = ' '
    e.target.elements.msg.focus()
})

//outputs Messages to the chat room
function outputMessage(message){

    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
    ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div)

}

//To display room name in chatApp
function outputRoomName(room){
    roomName.innerText = room
}

function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = user.username;
      userList.appendChild(li);
    });
  }
  