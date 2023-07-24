const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { addUser, getUsersInRoom, removeUser, getUser } = require("./User");
// const oldMessages = {};
const rooms = {};
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
  },
});
app.get("/", (req, res) => {
  req.nameValue = "Sunil";

  res.send(`<h1>Hello ${req.nameValue}</h1>`);
});
app.get("/:id", (req, res) => {
  console.log(req);

  res.send(`<h1>Hello ${req.params.id}</h1>`);
});
app.post("/", (req, res) => {
  req.nameValue = "Sunil";

  res.send(`<h1>Hello ${req.nameValue}</h1>`);
});
io.on("connection", (socket) => {
  //   console.log("a user connected", params);
  socket.on("join", ({ name, room, password }, callback) => {
    const isJoining = userJoin(socket.id, name, room, password, socket);
    // const userD = getUser(socket.id);
    if (isJoining) {
      const { error, user } = addUser({
        id: socket.id,
        name,
        room,
      });
      // console.log(error);

      if (error) {
        // socket.join(existingUser.room);
        socket.join(room);
        return callback();
      }

      // Emit will send message to the user
      // who had joined
      socket.emit("message", {
        user: "admin",
        text: `${user.name},
            welcome to room ${user.room}.`,
      });

      // Broadcast will send message to everyone
      // in the room except the joined user
      socket.broadcast
        .to(user.room)
        .emit("message", { user: "admin", text: `${user.name}, has joined` });

      socket.join(user.room);

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
      // socket.emit("old", oldMessages[user.room]);
      callback();
    } else {
      return callback("Password is incorrect.");
    }
  });
  // socket.on('rejoin', ()=>{

  // })
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    // console.log(socket.id, getUsersInRoom(user.room));
    if (user) {
      io.to(user.room).emit("message", {
        user: user.name,
        text: message,
        sentDate: new Date(),
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
      callback();
    }
  });
  socket.on("left", () => {
    const user = removeUser(socket.id);
    // console.log(socket.id, getUsersInRoom(user.room));
    if (user) {
      // delete rooms[socket.id];
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left.`,
      });
      // oldMessages[user.room].push({ user: user.name, text: message });
      // io.to(user.room).emit("roomData", {
      //   room: user.room,
      //   users: getUsersInRoom(user.room),
      // });
    }
  });
  socket.on("typing", () => {
    const user = getUser(socket.id);
    // console.log(user);
    if (user) {
      socket.broadcast.to(user.room).emit("typing", {
        user: user.name,
        text: ` typing...`,
      });
    }
  });

  function userJoin(socketId, username, room, password, socket) {
    if (!rooms[room]) {
      if (!rooms[room]) {
        rooms[room] = {};
      }
      rooms[room].password = password;
      rooms[room][socketId] = username;
      rooms[socketId] = room;
      console.log("rooms1", rooms[socketId]);
      return true;
    } else {
      if (rooms[room].password == password) {
        rooms[socketId] = room;
        rooms[room][socketId] = username;
        // socket.emit("message", {
        //   user: "admin",
        //   text: `${username} welcome.`,
        // });
        socket.join(room);
        console.log("rooms2", rooms);
        return true;
      } else {
        console.log("rooms3", rooms);
        return false;
      }
    }
  }
});

server.listen(8000, () => {
  console.log("listening on *:8000");
});
