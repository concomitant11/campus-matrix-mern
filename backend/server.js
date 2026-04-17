import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// CORS


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://campusmatrix.onrender.com"
    ],
    credentials: true,
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "client")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Catch-all route for SPA
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start server and setup Socket.IO
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://campusmatrix.onrender.com"
    ],
    credentials: true,
  },
});

// Socket.IO logic
const users = new Map();

io.on("connection", (socket) => {
  // console.log("🔌 User connected:", socket.id);

  socket.on("addUser", (userId) => {
    if (userId) users.set(userId, socket.id);
  });

  socket.on("joinRoom", (chatId) => {
    socket.join(chatId);
  });

  socket.on("newMessage", (message) => {
    const chat = message.chat;
    if (!chat || !chat.users) return;

    // Emit exactly once to the entire room. The sender won't receive it by default.
    socket.to(chat._id).emit("newMessage", message);
  });

  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("typing", chatId);
  });

  socket.on("stopTyping", (chatId) => {
    socket.to(chatId).emit("stopTyping", chatId);
  });

  socket.on("disconnect", () => {
    // console.log("❌ User disconnected:", socket.id);
    for (let [userId, sockId] of users.entries()) {
      if (sockId === socket.id) {
        users.delete(userId);
        break;
      }
    }
  });
});

server.listen(PORT, () =>
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
);
