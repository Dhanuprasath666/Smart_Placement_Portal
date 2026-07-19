const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const User = require('./models/User');
const MentorRequest = require('./models/MentorRequest');

let io = null;

// Authenticate the socket connection using the same JWT flow as verifyToken
// (server/middleware/auth.js), but reading the token from the handshake
// instead of an Authorization header.
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is still active (not blocked)
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error('User not found'));
    }

    if (user.isBlocked) {
      return next(new Error('Your account has been blocked by admin'));
    }

    socket.user = decoded; // Mirrors req.user set by verifyToken
    next();

  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
};

// Allowed origins for the Socket.IO connection. Deliberately not gated on
// NODE_ENV (unlike the REST cors() in server.js) - localhost is always
// permitted so local testing works even when NODE_ENV is set to
// 'production' (as it is in this project's .env), and the deployed domains
// are always permitted so production still works.
const isAllowedSocketOrigin = (origin) => {
  if (!origin) return true; // non-browser clients (no Origin header), e.g. server-to-server
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true; // any local dev port
  if (origin === 'https://placement-portal-bk43.onrender.com') return true;
  if (/\.vercel\.app$/.test(origin)) return true; // any Vercel domain
  return false;
};

// Attaches Socket.IO to the existing HTTP server. Called once from server.js.
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => callback(null, isAllowedSocketOrigin(origin)),
      credentials: true
    }
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    // Join the room for one accepted mentor-student conversation.
    // Mirrors the same access checks as getMessages/sendMessage in
    // mentorController.js: must be a participant AND request must be accepted.
    socket.on('joinConversation', async (requestId) => {
      try {
        const userId = socket.user.userId;

        const mentorRequest = await MentorRequest.findById(requestId);

        if (!mentorRequest) {
          return socket.emit('conversationError', { message: 'Request not found' });
        }

        const isParticipant =
          mentorRequest.fromStudent.toString() === userId ||
          mentorRequest.toMentor.toString() === userId;

        if (!isParticipant) {
          return socket.emit('conversationError', { message: 'Access denied' });
        }

        if (mentorRequest.status !== 'accepted') {
          return socket.emit('conversationError', { message: 'Chat unlocks once the request is accepted' });
        }

        socket.join(requestId);

      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('conversationError', { message: 'Server error' });
      }
    });

    socket.on('leaveConversation', (requestId) => {
      socket.leave(requestId);
    });
  });

  return io;
};

// Lets REST controllers (e.g. mentorController.sendMessage) emit to a room
// after persisting a message. Returns null if sockets haven't been
// initialized yet so callers can guard against emitting.
const getIO = () => io;

module.exports = { initSocket, getIO };
