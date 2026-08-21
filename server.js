const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Attach Socket.io to the HTTP server
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a specific workspace room
    socket.on('join_workspace', (workspaceId) => {
      socket.join(`workspace_${workspaceId}`);
      console.log(`User ${socket.id} joined workspace group ${workspaceId}`);
    });

    // Join personal user room (for DMs)
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${socket.id} joined personal room ${userId}`);
    });

    // Handle incoming encrypted messages
    socket.on('send_message', (data) => {
      const { workshopId, message, recipientId } = data;
      console.log(`Message sent in workspace ${workshopId}`);
      
      if (recipientId) {
        // Direct Message: emit to recipient's personal room
        socket.to(`user_${recipientId}`).emit('receive_message', message);
      } else {
        // Group Message: Broadcast to everyone in the workspace EXCEPT the sender
        socket.to(`workspace_${workshopId}`).emit('receive_message', message);
      }
    });

    // Handle Read Receipts
    socket.on('messages_read', (data) => {
      const { workshopId, senderId, messageIds, readerId } = data;
      // Tell the sender that their messages were read
      if (senderId) {
        socket.to(`user_${senderId}`).emit('read_receipt', { messageIds, readerId });
      } else {
        socket.to(`workspace_${workshopId}`).emit('read_receipt', { messageIds, readerId });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  httpServer.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port} (with Socket.io)`);
    
    // Connect to Database and log to console immediately
    const prisma = new PrismaClient();
    prisma.$connect()
      .then(() => console.log('✅ Connected to Database (PostgreSQL)'))
      .catch((err) => console.error('❌ Failed to connect to Database:', err));
  });
});
