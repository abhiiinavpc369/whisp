// server.js
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import chatSocket from './modules/chat/chat.socket.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['https://whisps.netlify.app'], // frontend later
    credentials: true
  }
});

// Register socket logic
chatSocket(io);

async function startServer() {
  await connectDB();

  server.listen(ENV.PORT, () => {
    console.log(`🚀 Whisp backend running on port ${ENV.PORT}`);
  });
}

startServer();
