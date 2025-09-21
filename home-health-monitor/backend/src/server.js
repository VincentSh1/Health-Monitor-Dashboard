const express = require('express');
const cors = require('cors');
const dgram = require('dgram'); // UDP socket library (built into Node.js)
const app = express();

// Configuration
const HTTP_PORT = 3001;        // Port for React app to connect to
const UDP_PORT = 8080;         // Port to RECEIVE UDP data from hardware
const UDP_HOST = '0.0.0.0';    // Listen on ALL network interfaces (important!)

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let sensorReadings = [];
let latestReading = null;
let lastUdpReceived = null;
let connectedDevices = new Set(); // Track devices sending data

// Create UDP socket to RECEIVE data from hardware
const udpServer = dgram.createSocket('udp4');

// This is where you RECEIVE UDP data from external hardware/software
udpServer.on('message', (message, remote) => {
  try {
    console.log(`📡 UDP data RECEIVED from ${remote.address}:${remote.port}`);
    console.log('📦 Raw message:', message.toString());
    
    // Add the sender to our connected devices list
    connectedDevices.add(remote.address);
    
    // Parse the UDP message (adjust format based on what your hardware sends)
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (parseError) {
      // If not JSON, try to parse other formats
      console.log('⚠️  Message is not JSON, attempting other parsing...');
      data = parseCustomFormat(message.toString());
    }
    
    // Validate and process sensor data
    const reading = {
      pm25: parseFloat(data.pm25) || parseFloat(data.PM25) || 0,
      co2: parseFloat(data.co2) || parseFloat(data.CO2) || 0,
      voc: parseFloat(data.voc) || parseFloat(data.VOC) || 0,
      temperature: parseFloat(data.temperature) || parseFloat(data.temp) || 0,
      humidity: parseFloat(data.humidity) || parseFloat(data.humid) || 0,
      healthScore: 0, // Will calculate below
      timestamp: new Date().toISOString(),
      id: Date.now(),
      source: 'UDP_HARDWARE',
      deviceId: data.deviceId || data.device_id || remote.address,
      senderIP: remote.address,
      senderPort: remote.port
    };
    
    // Calculate health score
    reading.healthScore = calculateHealthScore(reading);
    
    // Store the reading
    sensorReadings.push(reading);
    latestReading = reading;
    lastUdpReceived = new Date();
    
    // Keep only last 100 readings to prevent memory issues
    if (sensorReadings.length > 100) {
      sensorReadings = sensorReadings.slice(-100);
    }
    
    console.log('✅ Processed sensor data:', {
      pm25: reading.pm25,
      co2: reading.co2,
      healthScore: reading.healthScore,
      from: remote.address
    });
    
    // Optional: Send acknowledgment back to hardware
    const ackMessage = JSON.stringify({ 
      status: 'received', 
      timestamp: new Date().toISOString(),
      healthScore: reading.healthScore 
    });
    
    udpServer.send(ackMessage, remote.port, remote.address, (error) => {
      if (error) {
        console.error('❌ Error sending UDP acknowledgment:', error);
      } else {
        console.log('📤 Acknowledgment sent to hardware');
      }
    });
    
  } catch (error) {
    console.error('❌ Error processing UDP message:', error);
    console.error('📦 Message content:', message.toString());
  }
});

// Function to parse custom data formats (modify based on your hardware format)
function parseCustomFormat(messageString) {
  // Example: If your hardware sends "PM25:15.2,CO2:420,TEMP:22.5"
  const data = {};
  
  try {
    // Split by comma and then by colon
    const pairs = messageString.split(',');
    pairs.forEach(pair => {
      const [key, value] = pair.split(':');
      if (key && value) {
        data[key.toLowerCase().trim()] = parseFloat(value.trim());
      }
    });
  } catch (error) {
    console.log('Could not parse custom format, using defaults');
  }
  
  return data;
}

// Handle UDP socket events
udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`🚀 UDP Server LISTENING for hardware data on ${address.address}:${address.port}`);
  console.log(`📡 Hardware should send UDP data to: ${getLocalIPAddress()}:${address.port}`);
});

udpServer.on('error', (error) => {
  console.error('❌ UDP Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${UDP_PORT} is already in use. Try a different port.`);
  }
});

// Get local IP address to show where hardware should send data
function getLocalIPAddress() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Start UDP server to receive data
udpServer.bind(UDP_PORT, UDP_HOST);

// Health score calculation function
function calculateHealthScore(data) {
  let score = 100;
  
  // Deduct points based on air quality
  if (data.pm25 > 12) score -= (data.pm25 - 12) * 2;
  if (data.co2 > 400) score -= (data.co2 - 400) / 10;
  if (data.voc > 1.0) score -= (data.voc - 1.0) * 20;
  
  // Temperature comfort zone (20-26°C)
  if (data.temperature < 20 || data.temperature > 26) {
    score -= Math.abs(data.temperature - 23) * 3;
  }
  
  // Humidity comfort zone (40-60%)
  if (data.humidity < 40 || data.humidity > 60) {
    score -= Math.abs(data.humidity - 50) / 2;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// REST API Endpoints (same as before, but now fed by UDP data)

// Get latest sensor data
app.get('/api/sensors/latest', (req, res) => {
  if (latestReading) {
    res.json(latestReading);
  } else {
    res.status(404).json({ error: 'No sensor data available' });
  }
});

// Get historical data
app.get('/api/sensors/history', (req, res) => {
  const recentReadings = sensorReadings.slice(-24);
  
  const chartData = recentReadings.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    pm25: reading.pm25,
    co2: reading.co2,
    voc: reading.voc,
    healthScore: reading.healthScore,
    temperature: reading.temperature,
    humidity: reading.humidity
  }));
  
  res.json(chartData);
});

// Health endpoint - shows connection status
app.get('/api/health', (req, res) => {
  const now = new Date();
  const isConnected = lastUdpReceived && (now - lastUdpReceived) < 30000; // 30 seconds timeout
  
  res.json({ 
    status: isConnected ? 'connected' : 'disconnected',
    lastUpdate: latestReading?.timestamp || null,
    lastUdpReceived: lastUdpReceived?.toISOString() || null,
    totalReadings: sensorReadings.length,
    udpPort: UDP_PORT,
    connectedDevices: Array.from(connectedDevices),
    listeningOn: `${getLocalIPAddress()}:${UDP_PORT}`
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend server with UDP RECEIVER is running!',
    timestamp: new Date().toISOString(),
    totalReadings: sensorReadings.length,
    udpReceivingPort: UDP_PORT,
    lastUdpReceived: lastUdpReceived?.toISOString() || 'Waiting for hardware data...',
    yourIPAddress: getLocalIPAddress(),
    instructions: `Tell hardware to send UDP data to: ${getLocalIPAddress()}:${UDP_PORT}`
  });
});

// Debug endpoint - show raw recent messages
app.get('/api/debug', (req, res) => {
  res.json({
    recentReadings: sensorReadings.slice(-5),
    connectedDevices: Array.from(connectedDevices),
    serverStatus: {
      httpPort: HTTP_PORT,
      udpPort: UDP_PORT,
      listeningOn: getLocalIPAddress()
    }
  });
});

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log('\n🚀 HEALTH MONITOR UDP RECEIVER STARTED');
  console.log('=======================================');
  console.log(`📊 Dashboard: http://localhost:${HTTP_PORT}`);
  console.log(`📡 UDP Receiver: ${getLocalIPAddress()}:${UDP_PORT}`);
  console.log(`🔍 Test endpoint: http://localhost:${HTTP_PORT}/api/test`);
  console.log('\n📝 INSTRUCTIONS FOR HARDWARE SENDER:');
  console.log(`   • Send UDP packets to: ${getLocalIPAddress()}:${UDP_PORT}`);
  console.log(`   • JSON format: {"pm25":15.2,"co2":420,"temperature":22.5,...}`);
  console.log(`   • Or custom format: "PM25:15.2,CO2:420,TEMP:22.5"`);
  console.log('\n⏳ Waiting for UDP data from hardware...\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  udpServer.close();
  process.exit(0);
});