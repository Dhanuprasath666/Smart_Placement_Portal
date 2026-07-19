import { io } from 'socket.io-client';

// Same backend origin the REST client in api.js talks to, minus the /api
// suffix (Socket.IO needs the bare server origin, not an API path). Falls
// back to the local Express server used by the Vite dev proxy.
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Single shared connection reused across the app so we don't open a new
// socket every time a component mounts. Starts disconnected; MentorChat
// (or any future real-time feature) connects it once a token is available.
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true
});

// Attaches the current JWT and opens the connection if it isn't already open.
export const connectSocket = (token) => {
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
