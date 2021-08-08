/**
 * This file is for the backend part of the sockets which will be hosted on Heroku
 * 
 * Using express and socket.io, the messages and chat will be sent back and forth
 * between the server and the client-side (which will be apache cordova in the www/
 * folder)
 */
/* We probs don't need express because it's just a message server */

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

//////ORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
io.on("connection", (socket) => {
    console.log("A user has connected");
    socket.on("disconnect", () => {
        console.log("Oh no the user left, hopefully the conversation was over. If not feel free to find someone else.");
    });
    socket.on("message", (messageFromClient) => {
        //Message received on server, send it to other client(s)
        //Be sure to sanitize message before sending it out
        io.broadcast.emit("message", messageFromClient); //the broadcast.emit instead of emit sends the message to everyone except the OG sender
    });
    //Get list of rooms: https://stackoverflow.com/questions/6631501/how-to-list-rooms-on-socket-io-nodejs-server
});
server.listen(PORT, () => {
    console.log(`Success, listening on port: ${PORT}`);
});