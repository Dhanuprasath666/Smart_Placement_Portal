const express = require('express');
<<<<<<< HEAD
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { initSocket } = require('./socket');
=======
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
>>>>>>> aea32e7ed93e3d02d9c09e812436b328a5716a43


// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://placement-portal-bk43.onrender.com',
        /\.vercel\.app$/  // Allow any Vercel domain
      ]
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const placementRoutes = require('./routes/placementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const companyVisitRoutes = require('./routes/companyVisitRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
<<<<<<< HEAD
const mentorRoutes = require('./routes/mentorRoutes');
=======
>>>>>>> aea32e7ed93e3d02d9c09e812436b328a5716a43

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company-visits', companyVisitRoutes);
app.use('/api/superadmin', superAdminRoutes);
<<<<<<< HEAD
app.use('/api/mentors', mentorRoutes);
=======
>>>>>>> aea32e7ed93e3d02d9c09e812436b328a5716a43



// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Placement Portal API is running!' });
});
// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

<<<<<<< HEAD
// Wrap the Express app in an http server so Socket.IO can attach to it
const server = http.createServer(app);
initSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
=======
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
>>>>>>> aea32e7ed93e3d02d9c09e812436b328a5716a43
  console.log(`🚀 Server is running on port ${PORT}`);
});