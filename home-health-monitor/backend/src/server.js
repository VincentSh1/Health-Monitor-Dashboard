const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Allow React app to connect
app.use(express.json()); // Parse JSON data

// In-memory storage (for development)
// In production, you'd use a real database like MongoDB or PostgreSQL
let sensorReadings = [];
let latestReading = null;

// Store sensor data from Arduino
app.post('/api/sensors', (req, res) => {
  console.log('Received sensor data:', req.body);
  
  const reading = {
    ...req.body,
    timestamp: new Date().toISOString(),
    id: Date.now()
  };
  
  // Store the reading
  sensorReadings.push(reading);
  latestReading = reading;
  
  // Keep only last 100 readings to prevent memory issues
  if (sensorReadings.length > 100) {
    sensorReadings = sensorReadings.slice(-100);
  }
  
  res.json({ success: true, message: 'Data received successfully' });
});

// Get latest sensor data (for React app)
app.get('/api/sensors/latest', (req, res) => {
  if (latestReading) {
    res.json(latestReading);
  } else {
    res.status(404).json({ error: 'No sensor data available' });
  }
});

// Get historical data (for charts)
app.get('/api/sensors/history', (req, res) => {
  // Return last 24 readings (for 4-hour history if reading every 10 min)
  const recentReadings = sensorReadings.slice(-24);
  
  // Format for chart display
  const chartData = recentReadings.map((reading, index) => ({
    time: new Date(reading.timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    pm25: parseFloat(reading.pm25) || 0,
    co2: parseFloat(reading.co2) || 0,
    voc: parseFloat(reading.voc) || 0,
    healthScore: parseInt(reading.healthScore) || 0,
    temperature: parseFloat(reading.temperature) || 0,
    humidity: parseFloat(reading.humidity) || 0
  }));
  
  res.json(chartData);
});

// Health endpoint (check if Arduino is sending data)
app.get('/api/health', (req, res) => {
  const now = new Date();
  const lastReading = latestReading ? new Date(latestReading.timestamp) : null;
  
  if (lastReading && (now - lastReading) < 60000) { // Less than 1 minute ago
    res.json({ status: 'connected', lastUpdate: latestReading.timestamp });
  } else {
    res.json({ status: 'disconnected', lastUpdate: lastReading?.timestamp || null });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend server is running!',
    timestamp: new Date().toISOString(),
    totalReadings: sensorReadings.length
  });
});

// Serve static files (if you build your React app)
app.use(express.static('build'));

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Test it: http://localhost:${PORT}/api/test`);
  console.log(`Arduino should POST to: http://localhost:${PORT}/api/sensors`);
});

// For development: Add some fake data every 30 seconds if no real data
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    if (!latestReading || (Date.now() - new Date(latestReading.timestamp).getTime()) > 80000) {
      console.log('Adding fake data for testing...');
      
      const fakeReading = {
        pm25: (Math.random() * 20 + 10).toFixed(1),
        co2: (Math.random() * 200 + 400).toFixed(0),
        voc: (Math.random() * 2).toFixed(2),
        temperature: (Math.random() * 8 + 18).toFixed(1),
        humidity: (Math.random() * 30 + 35).toFixed(0),
        healthScore: Math.floor(Math.random() * 40 + 60),
        deviceId: 'TEST_DEVICE',
        timestamp: new Date().toISOString(),
        id: Date.now()
      };
      
      sensorReadings.push(fakeReading);
      latestReading = fakeReading;
    }
  }, 30000);
}