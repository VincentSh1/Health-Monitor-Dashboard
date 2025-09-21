const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors()); 
app.use(express.json()); 


let sensorReadings = [];
let latestReading = null;

app.post('/api/sensors', (req, res) => {
  console.log('Received sensor data:', req.body);
  
  const reading = {
    ...req.body,
    timestamp: new Date().toISOString(),
    id: Date.now()
  };
  
  sensorReadings.push(reading);
  latestReading = reading;
  
  if (sensorReadings.length > 100) {
    sensorReadings = sensorReadings.slice(-100);
  }
  
  res.json({ success: true, message: 'Data received successfully' });
});

app.get('/api/sensors/latest', (req, res) => {
  if (latestReading) {
    res.json(latestReading);
  } else {
    res.status(404).json({ error: 'No sensor data available' });
  }
});

app.get('/api/sensors/history', (req, res) => {
  const recentReadings = sensorReadings.slice(-24);
  
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

app.get('/api/health', (req, res) => {
  const now = new Date();
  const lastReading = latestReading ? new Date(latestReading.timestamp) : null;
  
  if (lastReading && (now - lastReading) < 60000) { // Less than 1 minute ago
    res.json({ status: 'connected', lastUpdate: latestReading.timestamp });
  } else {
    res.json({ status: 'disconnected', lastUpdate: lastReading?.timestamp || null });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend server is running!',
    timestamp: new Date().toISOString(),
    totalReadings: sensorReadings.length
  });
});

app.use(express.static('build'));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Test it: http://localhost:${PORT}/api/test`);
  console.log(`Arduino should POST to: http://localhost:${PORT}/api/sensors`);
});

if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    if (!latestReading || (Date.now() - new Date(latestReading.timestamp).getTime()) > 50000) {
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