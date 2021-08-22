// import io from "socket.io-client";
// const io = require("socket.io-client");
// import { LowSync, JSONFileSync } from "lowdb";
// import { join, dirname } from "path";
// import { fileURLToPath } from "url";

// const __dirname = dirname(fileURLToPath(import.meta.url));

// const file = join(__dirname, "db.json");
// const adapter = new JSONFileSync(file);
// const db = new LowSync(adapter);

// db.read();

// console.log(db.data);

// db.data.rooms.room1.data.push({
//   username: "anupam",
//   message: "Hi there1232132132132131?",
// });

// db.write();

// console.log(db.data.rooms.room1.data);

// const socket = io("http://localhost:3001", { query: "username=anupam" });

startSend();

function startSend() {
  console.log("Starting");
  var currentChunk = 0;
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    const testChunk = [];
    var audioChunks = [];
    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
      testChunk.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      // console.log(audioChunks[0]);
      // console.log(testChunk);
      const audioBlob = new Blob(audioChunks);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      console.log(audioChunks);
      audioChunks = [];

      currentChunk += 1;
      audio.play();
    });

    let timeout = setInterval(() => {
      mediaRecorder.stop();
      mediaRecorder.start();
    }, 500);
    setTimeout(() => {
      clearInterval(timeout);
    }, 10000);
  });
}
