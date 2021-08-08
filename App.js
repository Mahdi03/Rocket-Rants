/**
 * This file is for the backend part of the sockets which will be hosted on Heroku
 * 
 * Using express and socket.io, the messages and chat will be sent back and forth
 * between the server and the client-side (which will be apache cordova in the www/
 * folder)
 */
/* We probs don't need express because it's just a message server
    we needed express to serve our site on the same host, also accidentally
    avoided cors ya yeet
*/
const { v4: uuidv4 } = require('uuid');

const express = require('express'); //npm install express
const PORT = process.env.PORT || 5000;
const path = require("path"); //Maybe to add paths?
const app = express();

//Might need if we wanna render HTML?
app.engine('html', require('ejs').renderFile); //Used to render HTML - npm install html
app.engine('css', require('ejs').renderFile); //Used to render CSS - npm install css
app.use(express.static(path.join(__dirname, 'www'))); //Used to find "public" folder outside of folder of this script and serve CSS/JS files
app.use(
    express.urlencoded({
        extended: true
    })
);

app.get("/", (req, res) => {
    res.sendFile(__dirname + 'www/index.html');
});

/*app.listen(PORT, () => {
    console.log(`Success, listening on port: ${PORT}`);
});*/

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
/*
//For CORS try
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});*/
io.on("connection", (socket) => {
    socket.on("joinRoom", (roomName) => {
        socket.join(roomName);
        console.log("Joined " + roomName);
        //All the rooms will be defined once they join rooms
        var rooms = io.sockets.adapter.rooms;
        var rantingWaitingRoom = rooms.get('waitingRoom-ranters');
        //console.log(rantingWaitingRoom)
        //var rantingWaitingRoom = io.sockets.adapter.rooms.get('waitingRoom-ranters'); //Returns a Set() from a Map()
        var usersInRantingWaitingRoom = [];
        if (rantingWaitingRoom) {
            usersInRantingWaitingRoom = Array.from(rantingWaitingRoom);
        }
        //console.log(usersInRantingWaitingRoom);
        var listeningWaitingRoom = rooms.get("waitingRoom-listeners"); //Returns a Set() from a Map()
        var usersInListeningWaitingRoom = [];
        if (listeningWaitingRoom) {
            console.log("is this running??");
            usersInListeningWaitingRoom = Array.from(listeningWaitingRoom);
        }
        while (usersInRantingWaitingRoom.length > 0 && usersInListeningWaitingRoom.length > 0) {
            var nextInLineRanter = usersInRantingWaitingRoom[0];
            var nextInLineListener = usersInListeningWaitingRoom[0];
            //We don't need to pop them from those arrays tho because the next time someone connects, the arrays are recalculated
            //anyways, and by that time the user here has already left the waiting room and is joining their discussion room
            //disregard all that, they need to be popped because we are running this function as much as needed in a loop
            //Get a unique room ID
            var uniqueRoomID = uuidv4();
            console.log("hello");
            io.to(nextInLineRanter).emit("roomFound", uniqueRoomID);
            io.to(nextInLineListener).emit("roomFound", uniqueRoomID);
            usersInRantingWaitingRoom.splice(usersInRantingWaitingRoom.indexOf(nextInLineRanter), 1); //Removes nextInLineRanter from arr
            usersInListeningWaitingRoom.splice(usersInListeningWaitingRoom.indexOf(nextInLineListener), 1) //Removes nextInLineListener from arr
        }

    });
    socket.on("leaveRoom", (roomName) => {
        socket.leave(roomName);
    });
    console.log("A user has connected");
    //Lets look at users in venting waiting room and users in listening waiting room
    //Get all users in venting waiting room
    socket.on("disconnect", () => {
        console.log("Oh no the user left, hopefully the conversation was over. If not feel free to find someone else.");
    });
    socket.on("message", (messageObj) => {
        //Message received on server, send it to other client(s)
        var roomID = messageObj.roomID;
        var message = messageObj.messageText;
        //Be sure to sanitize message before sending it out
        socket.to(roomID).emit("message", message); //Send message to everyone in room except OG sender
    });
    //Test to see if server can actually communicate back to user
    setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
    //Get list of rooms: https://stackoverflow.com/questions/6631501/how-to-list-rooms-on-socket-io-nodejs-server
});
server.listen(PORT, () => {
    console.log(`Success, listening on port: ${PORT}`);
});