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

    if (!room.players.some(existingUser => existingUser.email === user.email)) {
        // Add the user to the room if not already present
        room.players.push(user);
      }

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

async function getTheTrack(socket_id) {
    return new Promise(async (resolve, reject) => {
        const user = users_map[socket_id] || {};

        if (!user) {
            reject('User not found');
            return;
        }

        const accessToken = user.access_token;

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`Spotify API error: ${response.status}`);
            }

            const trackData = await response.json();
            resolve(trackData);
        } catch (error) {
            console.error('Error fetching track:', error);
            reject(error);
        }
    });
}


users_map = {}
roomcode_map = {}

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('joinRoom', (roomCode,email) => {
        if(!rooms[roomCode])
            {
                console.log('error','Pokój nie istnieje');
                return;
            }
        socket.join(roomCode);
        var user = rooms[roomCode].players.find(u => u.email === email);
        if (!user) {
        console.log('error', 'User not found');
        return ;
        }
        users_map[socket.id] = user;
        roomcode_map[socket.id] = roomCode;
        console.log(users_map);
        io.to(roomCode).emit('playerJoined',{name: user.name,image: user.image[0].url} , socket.id );
    });


    socket.on('get_my_track', async ()=>
        {
            if (!users_map[socket.id]) {
            socket.emit('error', 'User not found');
            return;
        }

        try {
            const track = await getTheTrack(socket.id);
            console.log(track);
            } 
        catch (error) {
            console.log(error);
            }
        });

    // Handle user disconnection
    socket.on('disconnect', () => {
        
        var user = users_map[socket.id];
        console.log(user);
        console.log(users_map);
        console.log(rooms);
        var roomCode = roomcode_map[socket.id];
        console.log(rooms[roomCode]);
        console.log(rooms[roomCode].players);
        if(!rooms[roomCode] || !roomCode)
            {
                return;
            }
        if(rooms[roomCode].players.length==1)
            {
                delete rooms[roomCode];
                delete users_map[socket.id];
                delete roomcode_map[socket.id];
                return;
            }
        if (user) {
            if (roomCode) {
                // Remove user from the room
                for(i=0; i<4 ;i++)
                {
                    if(rooms[roomCode].players[i]===user){
                    delete rooms[roomCode].players[i];}
                }
                rooms[roomCode].players=rooms[roomCode].players.filter(player => Object.keys(player).length > 0);
                
                // Notify the room about the user's disconnection
                io.to(roomCode).emit('playerLeft', {name: user.name,image: user.image[0].url});
            }
        }
        
        
        // Remove the user from the users_map
        delete users_map[socket.id];
        delete roomcode_map[socket.id]
    });

});


server.listen(3000, '0.0.0.0');
// module.exports = app;