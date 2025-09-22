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
    console.log(`UDP data RECEIVED from ${remote.address}:${remote.port}`);
    console.log('Raw message:', message.toString());
    
    // Add the sender to our connected devices list
    connectedDevices.add(remote.address);
    
    // Parse the UDP message (adjust format based on what your hardware sends)
    let data;
    try {
      // First try JSON parsing
      data = JSON.parse(message.toString());
      console.log('Parsed as JSON');
    } catch (parseError) {
      // If not JSON, try to parse other formats
      console.log('Message is not JSON, attempting other parsing...');
      data = parseCustomFormat(message.toString());
    }
    
    // Validate and process sensor data with your specific field names
    const reading = {
      pm25: parseFloat(data.pm25) || parseFloat(data.PM25) || 0,
      co2: parseFloat(data.co2) || parseFloat(data.CO2) || 0,
      voc: parseFloat(data.adc) || parseFloat(data.VOC) || 0,
      temperature: parseFloat(data.temperature) || parseFloat(data.temp) || 0,
      humidity: parseFloat(data.humidity) || parseFloat(data.humid) || 0,
      adc: parseFloat(data.adc) || 0, // Store ADC reading too
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
    
    console.log('Processed sensor data:', {
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
        console.error('Error sending UDP acknowledgment:', error);
      } else {
        console.log('Acknowledgment sent to hardware');
      }
    });
    
  } catch (error) {
    console.error('Error processing UDP message:', error);
    console.error('Message content:', message.toString());
  }
});

// Function to parse your specific hardware format
function parseCustomFormat(messageString) {
  // Your format: "adc reading: 20, co2: (ppm) 12, temp: 28.283386, humidity: 54.251099"
  const data = {};
  
  console.log('Parsing custom hardware format:', messageString);
  
  try {
    // Split by comma to get individual parts
    const parts = messageString.split(',');
    
    parts.forEach(part => {
      const trimmed = part.trim();
      
      // Handle different patterns
      if (trimmed.includes('adc reading:')) {
        // Extract: "adc reading: 20" -> 20
        const match = trimmed.match(/adc reading:\s*(\d+\.?\d*)/);
        if (match) {
          data.adc = parseFloat(match[1]);
          console.log('  ADC:', data.adc);
        }
      }
      else if (trimmed.includes('co2:')) {
        // Extract: "co2: (ppm) 12" -> 12
        const match = trimmed.match(/co2:\s*\(ppm\)\s*(\d+\.?\d*)/);
        if (match) {
          data.co2 = parseFloat(match[1]);
          console.log('   CO2:', data.co2, 'ppm');
        }
      }
      else if (trimmed.includes('temp:')) {
        // Extract: "temp: 28.283386" -> 28.283386
        const match = trimmed.match(/temp:\s*(\d+\.?\d*)/);
        if (match) {
          data.temperature = parseFloat(match[1]);
          console.log('  Temperature:', data.temperature, '°C');
        }
      }
      else if (trimmed.includes('humidity:')) {
        // Extract: "humidity: 54.251099" -> 54.251099
        const match = trimmed.match(/humidity:\s*(\d+\.?\d*)/);
        if (match) {
          data.humidity = parseFloat(match[1]);
          console.log('  Humidity:', data.humidity, '%');
        }
      }
    });
    
    // Set default values for missing sensors (you might not have PM2.5 or VOC)
    if (!data.pm25) {
      data.pm25 = 0; // Default if no PM2.5 sensor
      console.log('  PM2.5: Using default value (0) - no sensor data');
    }
    if (!data.voc) {
      data.voc = 0; // Default if no VOC sensor  
      console.log('  VOC: Using default value (0) - no sensor data');
    }
    
    console.log('  Parsed data:', data);
    
  } catch (error) {
    console.error('Error parsing custom format:', error);
    // Return defaults if parsing fails
    return {
      adc: 0,
      co2: 0,
      temperature: 0,
      humidity: 0,
      pm25: 0,
      voc: 0
    };
  }
  
  return data;
}

// Handle UDP socket events
udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`UDP Server LISTENING for hardware data on ${address.address}:${address.port}`);
  console.log(`Hardware should send UDP data to: ${getLocalIPAddress()}:${address.port}`);
});

udpServer.on('error', (error) => {
  console.error('UDP Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${UDP_PORT} is already in use. Try a different port.`);
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
  let score = 100; // Start with perfect score
  
  console.log('Calculating health score for:', {
    pm25: data.pm25,
    co2: data.co2,
    voc: data.voc,
    temperature: data.temperature,
    humidity: data.humidity
  });
  
  // PM2.5 Air Quality Impact (Fine Particulate Matter)
  // WHO guideline: 15 μg/m³ annual, 45 μg/m³ 24-hour
  // Good: 0-12, Moderate: 12.1-35.4, Unhealthy: 35.5+
  if (data.pm25 > 12) {
    const pm25Penalty = (data.pm25 - 12) * 2; // 2 points per μg/m³ over 12
    score -= pm25Penalty;
    console.log(`  PM2.5 penalty: -${pm25Penalty.toFixed(1)} (level: ${data.pm25})`);
  }
  
  // CO2 Impact (Carbon Dioxide - Indoor Air Quality)
  // Good: 350-800ppm, Acceptable: 800-1500ppm, Poor: 1500+ppm
  if (data.co2 > 800) {
    const co2Penalty = (data.co2 - 600) / 10; // 1 point per 10ppm over 400
    score -= co2Penalty;
    console.log(`  CO2 penalty: -${co2Penalty.toFixed(1)} (level: ${data.co2}ppm)`);
  }
  
  // VOC Impact (Volatile Organic Compounds)
  // Good: 0-1.0, Moderate: 1.0-3.0, Poor: 3.0+
  if (data.voc > 50.0) {
    const vocPenalty = (data.voc - 1.0); // 20 points per unit over 1.0
    score -= vocPenalty;
    console.log(`  VOC penalty: -${vocPenalty.toFixed(1)} (level: ${data.voc})`);
  }
  
  // Temperature Comfort Zone (Human Comfort)
  // Optimal: 20-26°C (68-78°F)
  const optimalTemp = 23; // 23°C is ideal
  if (data.temperature < 20 || data.temperature > 26) {
    const tempPenalty = Math.abs(data.temperature - optimalTemp) * 3; // 3 points per degree from optimal
    score -= tempPenalty;
    console.log(`  Temperature penalty: -${tempPenalty.toFixed(1)} (${data.temperature}°C, optimal: ${optimalTemp}°C)`);
  }
  
  // Humidity Comfort Zone (Human Comfort & Health)
  // Optimal: 40-60% (prevents mold growth and respiratory issues)
  const optimalHumidity = 50; // 50% is ideal
  if (data.humidity < 40 || data.humidity > 60) {
    const humidityPenalty = Math.abs(data.humidity - optimalHumidity) / 2; // 0.5 points per % from optimal range
    score -= humidityPenalty;
    console.log(`  Humidity penalty: -${humidityPenalty.toFixed(1)} (${data.humidity}%, optimal: 40-60%)`);
  }
  
  // Ensure score stays within 0-100 range
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  
  console.log(`  Final Health Score: ${finalScore}/100`);
  
  return finalScore;
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
  console.log('\nHEALTH MONITOR UDP RECEIVER STARTED');
  console.log('\nHEALTH MONITOR UDP RECEIVER STARTED');
  console.log('=======================================');
  console.log(`Dashboard: http://localhost:${HTTP_PORT}`);
  console.log(`UDP Receiver: ${getLocalIPAddress()}:${UDP_PORT}`);
  console.log(`Test endpoint: http://localhost:${HTTP_PORT}/api/test`);
  console.log('\nINSTRUCTIONS FOR HARDWARE SENDER:');
  console.log(`Dashboard: http://localhost:${HTTP_PORT}`);
  console.log(`UDP Receiver: ${getLocalIPAddress()}:${UDP_PORT}`);
  console.log(`Test endpoint: http://localhost:${HTTP_PORT}/api/test`);
  console.log('\nINSTRUCTIONS FOR HARDWARE SENDER:');
  console.log(`   • Send UDP packets to: ${getLocalIPAddress()}:${UDP_PORT}`);
  console.log(`   • JSON format: {"pm25":15.2,"co2":420,"temperature":22.5,...}`);
  console.log(`   • Or custom format: "PM25:15.2,CO2:420,TEMP:22.5"`);
  console.log('\nWaiting for UDP data from hardware...\n');
  console.log('\nWaiting for UDP data from hardware...\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  udpServer.close();
  process.exit(0);
});