import { LowSync, JSONFileSync } from "lowdb";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Express from "express";
import { Server } from "socket.io";

const __dirname = dirname(fileURLToPath(import.meta.url));

const file = join(__dirname, "db.json");
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter);

db.read();

const app = Express();

var users = {};

const server = app.listen(process.env.PORT || 3001, () => {
  console.log("server running on port 3001");
});

const io = new Server(server, {
  cors: true,
  origins: "*",
});

app.get("/rooms", (req, res) => {
  console.log(io.sockets.adapter.rooms);
  res.send(io.sockets.adapter.rooms);
});

io.on("connection", (socket) => {
  let username = socket.handshake.query.username;
  console.log(username, "connected to the server");

  db.data.users[username].rooms.forEach((element) => {
    socket.join(element);
  });

  users[socket.id] = username;

  socket.on("send", (data) => {
    var room = data["room"];
    console.log(room, data);

    var dbData = { username: data["username"], message: data["message"] };
    db.data.rooms[room]["data"].push(dbData);
    io.sockets.in(room).emit("MESSAGE", data);
    db.write();
  });

  socket.on("createRoom", (payload) => {
    var room = payload["room"];
    var username = payload["username"];
    console.log(room, username);
    if (!Object.keys(db.data.rooms).includes(room)) {
      db.data.users[username].rooms.push(room);
      db.data.rooms[room] = { owner: username, data: [] };
    }
    socket.join(room);
    db.write();
    var roomData = {};
    db.data.users[username].rooms.forEach((element) => {
      console.log(element);
      roomData[element] = db.data.rooms[element].data;
    });
    socket.emit("returnData", roomData);
  });

  socket.on("joinRoom", (payload) => {
    var room = payload["room"];
    var username = payload["username"];
    console.log(room, username);
    if (Object.keys(db.data.rooms).includes(room)) {
      db.data.users[username].rooms.push(room);
    }
    socket.join(room);
    db.write();
    var roomData = {};
    db.data.users[username].rooms.forEach((element) => {
      console.log(element);
      roomData[element] = db.data.rooms[element].data;
    });
    socket.emit("returnData", roomData);
  });
  socket.on("joinCall", (data) => {
    socket.join(data["room"]);
    console.log(users[socket.id], "joined", data["room"]);
  });
  socket.on("leaveCall", (data) => {
    socket.leave(data["room"]);
    console.log(users[socket.id], "left", data["room"]);
  });
  socket.on("audioData", (data) => {
    console.log(data["room"]);
    io.sockets.in(data["room"]).emit("audioMessage", data);
  });
  socket.on("fetchData", (username) => {
    var roomData = {};
    db.data.users[username].rooms.forEach((element) => {
      console.log(element);
      roomData[element] = db.data.rooms[element].data;
    });
    socket.emit("returnData", roomData);
  });
  socket.on("disconnect", () => {
    console.log(users[socket.id], "has been disconnected");
    delete users[socket.id];
  });
});
