//// mvcc model-view-control structure

const express = require('express');
const app = express();
const path = require("path")
const server = require("http").Server(app);
// peer js simplifies WebRTC peer to peer data, video, and audio  calls.

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, { debug: true, });

//UUID (universally unique identifier) is a library.
const{v4: uuidv4} = require("uuid") //generates unique id when the home  page is refreshed

// Socket.IO is an event-driven library for real-time web applications. It enables real-time, bi-directional communication between web clients and servers.
const io = require("socket.io")(server);
//EJS (embaded java script) templet engines 


//html following ejs format enables us use or embade javascript.
// ejs lets us use variables on html.
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));//ackowledging where the public follder is. and allowing it  to be used.
app.use('/peerjs', peerServer);

// //using render method
// app.get("/", (req, res) => {
//     res.render('room');
// })

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`); //uuidv4 is the same as  room
//   res.redirect(`/`);
    
});

app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room})
})

//creation of socket.io connection
// listening the join room  meessage from frontend.
io.on('connection', (socket) => {
    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      // socket.to(roomId).broadcast.emit('user-connected', userId)// not working for me.
      //socket.broadcast.emit()
      io.to(roomId).emit("user-connected", userId);
      console.log(`Theo joined the room id #: ${roomId}`);
      
      socket.on('message', (message) => {
        //send message to the same room
        io.to(roomId).emit('createMessage', message);
      });
        
        // when the user disconnects

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        });
    });
});






server.listen(process.env.PORT || 2000)  //2000