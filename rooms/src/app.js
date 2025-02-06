require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { authenticateJWT } = require('./middleware');
const crypto = require('crypto');
const http = require('http');
const socketIo = require('socket.io');
const ip_address = process.env.SERVER_IP

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

function generateRoomCode() {
    return crypto.randomBytes(4).toString('hex'); // Generates 8 characters (4 bytes = 8 hex characters)
}

rooms={}
users_map = {}

app.use(cookieParser());
app.use(express.static(__dirname+"/public"));
app.set('view engine', 'ejs');
app.set('views', './src/views');

app.get('/create-room', authenticateJWT, async function(req, res) {
    const user = req.user; // The authenticated user
    
    // Generate a unique room code
    let roomCode = generateRoomCode();

    // Ensure the room code is unique (in case of a collision)
    while (rooms[roomCode]) {
        roomCode = generateRoomCode();
    }

    // Create the room (store it in memory for now)
    rooms[roomCode] = {
        players: [],
    };

    // Redirect the user to the new room
    res.redirect(`/room/${roomCode}`);
});

app.get('/room/:roomCode', authenticateJWT, async function(req, res) {
    const roomCode = req.params.roomCode;
    const user = req.user;

    // Check if the room exists and has space (maximum 4 players)
    if (!rooms[roomCode]) {
        return res.status(404).send('Room not found');
    }

    const room = rooms[roomCode];
    
    if (room.players.length >= 4) {
        return res.status(400).send('Room is full');
    }

    // Add the user to the room
    room.players.push(user);

    users=[];

    for(i=0;i<4;i++){
        placeholder=room.players[i]?{username: room.players[i].name , image: room.players[i].image[0].url}:{username: "Wolne Miejsce", image: "/pics/placeholder_pic.jpg"};
        users.push(placeholder);
        }
    
    // Redirect the user to the room page (with user data, or other information as needed)
    res.render('room', {users: users, roomcode: roomCode, me: user.email, ip:ip_address})

    // Socket.IO logic: Join the user to the corresponding Socket.IO room
    io.to(roomCode).emit('playerJoined', user); // Notify others in the room
});


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('joinRoom', (roomCode,email) => {
        socket.join(roomCode);
        const user = rooms[roomCode].players.find(u => u.email === email);
        if (!user) {
        socket.emit('error', 'User not found');
        return ;
        }
        console.log(rooms[roomCode]);
        users_map[socket.id] = user;
        io.to(roomCode).emit('playerJoined',{name: user.name,image: user.image[0].url} , socket.id );
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
        
        const user = users_map[socket.id]; // Get user from the users_map using socket id

        if (user) {
            // Find the room they were in
            const roomCode = Object.keys(rooms).find(code => rooms[code].players.some(u => u.email === user.email));

            if (roomCode) {
                // Remove user from the room
                rooms[roomCode].players = rooms[roomCode].players.filter(u => u.email !== user.email);
                
                // Notify the room about the user's disconnection
                io.to(roomCode).emit('playerLeft', `${user.name} has left the room`);
            }
        }

        // Remove the user from the users_map
        delete users_map[socket.id];
    });

});


server.listen(3000, '0.0.0.0');
// module.exports = app;