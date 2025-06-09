import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import groupsRoutes from './routes/groups';
import usersRoutes from './routes/users';
import { authenticateSocket } from './middleware/socketAuth';
import { handleConnection, handleDisconnection } from './handlers/connections';
import { handleGetMessages, handleGroupMessage, handlePrivateMessage } from './handlers/messages';
import { handleMarkAsRead, handleTyping } from './handlers/messageStatus';

dotenv.config();

const app = express();
const server = createServer(app);

// cors and server for socket.io 
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
})

const PORT = process.env.PORT || 5000;

// cors middleware for express routes ie api
app.use(cors({
    origin: "*",
    credentials: true
}))
// limitation of message's size
app.use(express.json({
    limit: '10mb',
}));

app.use(express.urlencoded({
    extended: true
}))


// basic route
app.get('/', (req, res) => {
    res.json({
        message: "Chat App server is running...",
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// authentication routes
app.use('/api/auth', authRoutes);
// users routes
app.use('/api/users', usersRoutes);
// group related routes
app.use('/api/groups', groupsRoutes);

// socket.io authentication middleware for incoming socket connection
io.use(authenticateSocket);

// socket.io connection
io.on("connection", (socket) => {

    // handle initial connection ie when user cunnects successfully
    handleConnection(io, socket);

    // listen for private messages
    socket.on('private_message', (data) => {
        // console.log(data)
        handlePrivateMessage(io, socket, data)
    });

    // listen for group messages
    socket.on('group_message', (data) => {
        handleGroupMessage(io, socket, data)
    });

    // listen for requests to get message history
    socket.on('get_messages', (data) => {
        handleGetMessages(socket, data);
    });

    // listen for typing indicator 
    socket.on('typing', (data) => {
        handleTyping(io, socket, data);
    });

    // list for events to mark messages as read
    socket.on('mark_as_read', (data) => {
        handleMarkAsRead(socket, data);
    });

    // listen for client disconnection events
    socket.on('disconnect', () => {
        handleDisconnection(io, socket)
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
    console.log(`Node Environment: ${process.env.NODE_ENV || 'development (NODE_ENV not set)'}`);
})

