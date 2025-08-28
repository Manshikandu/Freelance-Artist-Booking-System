// import ChatApp from "../model/Chat.model.js";
// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();
// const server = http.createServer(app);

// export const io = new Server(server, {
//   cors: { origin: ["http://localhost:5173"], methods: ["GET", "POST"] },
// });

// // userId -> Set<socketId>  (Set avoids duplicates)
// const userSocketMap = new Map();
// export const getReceiverSocketIds = (userId) =>
//   [...(userSocketMap.get(String(userId)) || [])];

// io.on("connection", (socket) => {
//   const userId = socket.handshake.query.userId; // sent from FE when connecting
//   if (userId) {
//     if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
//     userSocketMap.get(userId).add(socket.id);
//     console.log(`✅ ${userId} connected on ${socket.id}`);
//   }

//   io.emit("getOnlineUsers", [...userSocketMap.keys()]);

//   /* ---------------- REALTIME MESSAGING ---------------- */
//   socket.on("sendMessage", async (payload) => {
//     try {
//       const newMsg = await ChatApp.create(payload); // DB persisted ✅
//       // Convert senderId and receiverId to strings for frontend alignment
//       const msgToSend = {
//         ...newMsg._doc,
//         senderId: newMsg.senderId?.toString(),
//         receiverId: newMsg.receiverId?.toString(),
//       };

//       // to every socket of the receiver
//       getReceiverSocketIds(payload.receiverId).forEach((id) =>
//         io.to(id).emit("receiveMessage", msgToSend)
//       );

//       // echo to all sender sockets so every tab stays in sync
//       getReceiverSocketIds(payload.senderId).forEach((id) =>
//         io.to(id).emit("messageSent", msgToSend)
//       );
//     } catch (err) {
//       console.error("❌ sendMessage error:", err.message);
//       socket.emit("errorMessage", { error: "Failed to send message" });
//     }
//   });

//   socket.on("disconnect", () => {
//     if (userId && userSocketMap.has(userId)) {
//       userSocketMap.get(userId).delete(socket.id);
//       if (userSocketMap.get(userId).size === 0) userSocketMap.delete(userId);
//     }
//     io.emit("getOnlineUsers", [...userSocketMap.keys()]);
//     console.log(`❌ ${socket.id} disconnected`);
//   });
// });

// export { app, server };


//socket
//sat
// socket.js ─ only the relevant part
import ChatApp from "../model/Chat.model.js";
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: ["http://localhost:5173"], methods: ["GET", "POST"] },
  // credentials: true //new
});

// userId -> Set<socketId>  (Set avoids duplicates)
const userSocketMap = new Map();
export const getReceiverSocketIds = (userId) =>
  [...(userSocketMap.get(String(userId)) || [])];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId; // sent from FE when connecting
  if (userId) {
    if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
    userSocketMap.get(userId).add(socket.id);
    // console.log(` ${userId} connected on ${socket.id}`);
  }

  io.emit("getOnlineUsers", [...userSocketMap.keys()]);

  /* ---------------- REALTIME MESSAGING ---------------- */
  socket.on("sendMessage", async (payload) => {
    try {
      const newMsg = await ChatApp.create(payload);

      // to every socket of the receiver
      getReceiverSocketIds(payload.receiverId).forEach((id) =>
        io.to(id).emit("receiveMessage", newMsg)
      );

      // echo to all sender sockets so every tab stays in sync
      getReceiverSocketIds(payload.senderId).forEach((id) =>
        io.to(id).emit("messageSent", newMsg)
      );
    } catch (err) {
      console.error(" sendMessage error:", err.message);
      socket.emit("errorMessage", { error: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    if (userId && userSocketMap.has(userId)) {
      userSocketMap.get(userId).delete(socket.id);
      if (userSocketMap.get(userId).size === 0) userSocketMap.delete(userId);
    }
    io.emit("getOnlineUsers", [...userSocketMap.keys()]);
    console.log(` ${socket.id} disconnected`);
  });
});

export { app, server };

