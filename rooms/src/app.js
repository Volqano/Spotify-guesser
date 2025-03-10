require('dotenv').config();
const axios = require('axios');
const express = require('express');
const cookieParser = require('cookie-parser');
const { authenticateJWT } = require('./middleware');
const crypto = require('crypto');
const http = require('http');
const socketIo = require('socket.io');
const { cleanSongTitle, getSongNameFromData } = require('./helpers');
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
        placeholder=room.players[i] ? {
            username: room.players[i].name,
            image: (room.players[i].image && room.players[i].image.length > 0) 
            ? room.players[i].image[0].url 
            : "/pics/placeholder_pic.jpg"
        } : {
            username: "Wolne Miejsce",
            image: "/pics/placeholder_pic.jpg"
        };
        users.push(placeholder);
    }
    
    // Redirect the user to the room page (with user data, or other information as needed)
    res.render('room', {users: users, roomcode: roomCode, me: user.email, ip:ip_address})

    // Socket.IO logic: Join the user to the corresponding Socket.IO room
});


const getRefreshToken = async (user) => {

    // refresh token that has been previously stored
    const url = "https://accounts.spotify.com/api/token";
 
     const payload = {
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
       },
       body: new URLSearchParams({
         grant_type: 'refresh_token',
         refresh_token: user.refresh_token,
         client_id: user.id
       }),
     }
     const body = await fetch(url, payload);
     const response = await body.json();
 
     user.access_token = response.access_token;
     if (response.refreshToken) {
       user.refresh_token = response.refresh_token;
     }
   }


async function playTheTrack(track_data, user) {
    console.log(track_data)
    if(!track_data)
        {
            console.log('takiego tracku to nie puszcze');
            return;
        }
    let accessToken = user.access_token;
    console.log(`ACCESS TOKEN: ${accessToken}`)
    let track_uri = track_data.item.uri;
    console.log(`TRACK_DATA: ${track_data}`)
    let track_position_ms = track_data.progress_ms; // Progress into the currently playing track or episode
    console.log(`TRACK POSITION MS: ${track_position_ms}`) 

    try {
        let devicesResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        let devices = await devicesResponse.json();
        console.log(devices);

        if (!devices.devices || devices.devices.length === 0) {
            console.error('No devices found.');
            return;
        }

        let device = devices.devices[0];
        let device_id = device.id;
        console.log(`DEVICE_ID: ${device_id}`) 

        let playResponse = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                uris: [track_uri],
                position_ms: track_position_ms
            }),
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (playResponse.ok) {
            console.log('Track is playing now!');
        } else {
            console.log('Error starting track:', await playResponse.json());
        }
    } catch (error) {
        console.error('Error:', error);
    }

}


async function getTheTrack(socket_id) {
        let user = users_map[socket_id] || {};

        if (!user) {
            throw new Error(`User not found`);
        }

        let accessToken = user.access_token;
        console.log(accessToken);
        try {
            let response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.status == 401) {
                console.log("Access token expired, refreshing...");

                // Refresh the token
                await getRefreshToken(user);

                // Retry the request with the new access token
                accessToken = user.access_token;
                let retryResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (retryResponse.ok) {
                    let trackData =await retryResponse.json();
                    return trackData;
                } else {
                    throw new Error(`Spotify API error: ${retryResponse.status}`);
                }
            }
            if(response.ok){
            let trackData =await response.json();
            console.log(trackData)
            return trackData;
            }
            else
            {
                throw new Error(`Spotify API error: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching track:', error);
            return error;
        }
    
}


users_map = {}
roomcode_map = {}
piosenki = {}

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
        io.to(roomCode).emit('playerJoined', {
            name: user.name,
            image: user.image && user.image.length > 0 ? user.image[0].url : "/pics/placeholder_pic.jpg"
        }, socket.id);
    });

    socket.on('startTimer', ()=>
    {
        roomCode=roomcode_map[socket.id];
        io.to(roomCode).emit('startTimer');
    });

    socket.on('turnChange', (active_users,turn)=>
        {
            turn = (turn + 1) % active_users.length;
            roomCode=roomcode_map[socket.id];
            io.to(roomCode).emit('turnChange',active_users[turn]);
        });

    socket.on('submitGuess',(guess)=>
        {
            console.log(piosenki[roomcode_map[socket.id]]);
            console.log(guess);
            
            piosenki[roomcode_map[socket.id]]==guess?socket.emit('guessResult',true):socket.emit('guessResult',false);

        })
    socket.on('get_my_track', async ()=>
        {
            if (!users_map[socket.id]) {
            socket.emit('error', 'User not found');
            return;
        }

        try {
            const track = await getTheTrack(socket.id);
            players = rooms[roomcode_map[socket.id]].players;
            console.log("PLAYER LENGTH: ");
            console.log(players.length);
            for(let i = 0; i < players.length; i++)
                {
                    console.log("WBILEM DO PETLI POZDRO ");
                    playTheTrack(track,players[i]);
                }
            piosenki[roomcode_map[socket.id]] = cleanSongTitle(getSongNameFromData(track));
            }

        catch (error) {
            console.log(error);
            }
        });

    // Handle user disconnection
    socket.on('disconnect', () => {
        
        var user = users_map[socket.id];
        var roomCode = roomcode_map[socket.id];
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
                io.to(roomCode).emit('playerLeft', {
                    name: user.name,
                    image: user.image && user.image.length > 0 ? user.image[0].url : "/pics/placeholder_pic.jpg"
                });
            }
        }
        
        
        // Remove the user from the users_map
        delete users_map[socket.id];
        delete roomcode_map[socket.id]
    });

});


server.listen(3000, '0.0.0.0');
// module.exports = app;