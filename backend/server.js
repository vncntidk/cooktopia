import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Determine allowed frontend origins (array or environment)
const allowedOrigins = [
  process.env.FRONTEND_URL,            // For deployment (e.g. https://cooktopia.com)
  'http://localhost:5173',             // Vite dev server
  'http://localhost:3000',             // React default dev server
].filter(Boolean);                     // filter out any empty values

// CORS Middleware: supports multiple local dev ports
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Upload service is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Upload server running on port ${PORT}`);
  console.log(`📁 Health check: http://localhost:${PORT}/api/health`);
});
