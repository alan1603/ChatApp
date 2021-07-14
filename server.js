const path = require("path")
const express = require("express")
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = 3000
const botName = "Admin"
//For setting up static files
app.use(express.static(path.join(__dirname, 'public')))

//Runs when the client connects
io.on('connection', socket=>{

  socket.on('joinRoom', ({username, room})=>{

    const user = userJoin(socket.id, username, room)
    socket.join(user.room)

    //To welcome the user
    socket.emit('message', formatMessage(botName,'Welcome to ChatApp'))

    //To broadcast when a user enter the chat to the other clients
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`))
  
    // Send users and room info
    io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
    });
  })

  
  
  
  // Listening for messages
  socket.on('chatMessage', msg=>{
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  })
  //To inform that the user has disconnected
  socket.on('disconnect', ()=>{
    const user = userLeave(socket.id)
    if(user){
      io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`))

      //Send users and room info
      io.to(user.room).emit('roomUsers',{
      room: user.room,
      users: getRoomUsers(user.room)
      })
    }
    
  })

})


server.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
  })