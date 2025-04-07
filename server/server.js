import express from "express";
import http from "http";

import { Server } from "socket.io";
import * as data from "./data.js";

import * as colors from "./colors.js";

// Reads PORT from the OS, the --env-file flag, or defaults to 9000
const PORT = process.env.PORT || 9000;

// The express server (configured, then passed to httpServer)
const app = express();

// Allows static hosting content of the public/ folder
// https://expressjs.com/en/api.html#express.static
app.use(express.static("public"));

// Parses incoming requests with JSON payloads
// https://expressjs.com/en/api.html#express.json
app.use(express.json());

// Custom application-level middleware for logging all requests
app.use((req, _res, next) => {
  const timestamp = new Date(Date.now());
  console.log(
    `[${timestamp.toDateString()} ${timestamp.toTimeString()}] / ${timestamp.toISOString()}`
  );
  console.log(req.method, req.hostname, req.path);
  console.log("headers:", req.headers);
  console.log("body:", req.body);
  next();
});

// Creating an httpServer using the express configuration
// https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
const httpServer = http.createServer(app);

// New socket server
const io = new Server(httpServer, {});

// Socket event handling
// io.on("connect", newClientSocket => {
//   console.log(`New connection established (id: ${newClientSocket.id})`);

// Function to get all users in a room
const getUsersInRoom = async (roomName) => {
  // Get all socket instances in the room
  const sockets = await io.in(roomName).fetchSockets();

  // Extract user info from each socket
  const users = sockets.map((socket) => {
    // Access data stored on the socket
    return {
      userName: socket.data.userName,
      color: socket.data.color,
    };
  });

  return users;
};

io.on("connect", (socket) => {
  console.log("New connection", socket.id);

  socket.on("join", async (joinInfo) => {
    const { roomName, userName } = joinInfo;

    if (data.isUserNameTaken(userName)) {
      joinInfo.error = `The name ${userName} is already taken`;
    } else {
      joinInfo.color = colors.getRandomColor();
      data.registerUser(userName);
      socket.data = joinInfo;
      socket.join(roomName);

      socket.on("disconnect", async () => {
        data.unregisterUser(userName);
        colors.releaseColor(socket.data.color);
        data.addMessage(roomName, {
          sender: "",
          text: `${userName} has left the room`,
          timestamp: timestampOnJoin,
        });
        
        io.to(roomName).emit("chat update", data.roomLog(roomName));
        io.to(roomName).emit("room users", await getUsersInRoom(roomName));
        data.updateTypingStatus(roomName, userName, false);
        io.to(roomName).emit("typing", data.getTypingUsers(roomName));
      });

      const timestampOnJoin = Date.now();

      data.addMessage(roomName, {
        sender: "",
        text: `${userName} has joined the room`,
        timestamp: timestampOnJoin,
      });

      io.to(roomName).emit("chat update", data.roomLog(roomName));
      io.to(roomName).emit("room users", await getUsersInRoom(roomName));

      socket.on("message", (text) => {
        const timestampMsg = Date.now();
        const { roomName, userName, color } = socket.data;
        const messageInfo = {
          sender: userName,
          text,
          color,
          timestamp: timestampMsg,
        };
        console.log(roomName, messageInfo);
        data.addMessage(roomName, messageInfo);
        io.to(roomName).emit("chat update", data.roomLog(roomName));
      });

        socket.emit("typing", data.getTypingUsers(roomName));
        socket.on("typing", (typingInfo) => {
          const { roomName, userName, isTyping } = typingInfo;
          data.updateTypingStatus(roomName, userName, isTyping);
          io.to(roomName).emit("typing", data.getTypingUsers(roomName));
        });
    }

    console.log(joinInfo);
    socket.emit("join-response", joinInfo);
  });
});

// Start the server listening on PORT, then call the callback (second argument)
httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}`));
