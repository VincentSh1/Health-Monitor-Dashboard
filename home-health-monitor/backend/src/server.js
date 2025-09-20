const express = require('express');
const cors = require('cors');
const axios = require('axios'); // For Fitbit API calls
require('dotenv').config(); // For Fitbit environment variables

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Allow React app to connect
app.use(express.json()); // Parse JSON data
app.use(express.static('public')); // Fitbit added to serve dashboard

// In-memory storage (for development)
// In production, you'd use a real database like MongoDB or PostgreSQL
let sensorReadings = [];
let latestReading = null;
const userTokens = new Map(); // For Fitbit tokens

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

// NEW FITBIT ENDPOINTS:
// Start Fitbit OAuth flow
app.get('/auth/fitbit', (req, res) => {
  const authUrl = `https://www.fitbit.com/oauth2/authorize?` +
    `response_type=code&` +
    `client_id=${process.env.FITBIT_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.FITBIT_CALLBACK_URL)}&` +
    `scope=activity+heartrate+sleep+weight+profile&` +
    `state=${Math.random().toString(36).substring(7)}`;
  
  res.redirect(authUrl);
});

// Handle Fitbit OAuth callback
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.status(400).send('Authorization failed');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://api.fitbit.com/oauth2/token', 
      new URLSearchParams({
        clientId: process.env.FITBIT_CLIENT_ID,
        grant_type: 'authorization_code',
        redirect_uri: process.env.FITBIT_CALLBACK_URL,
        code: code
      }), {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            process.env.FITBIT_CLIENT_ID + ':' + process.env.FITBIT_CLIENT_SECRET
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, user_id } = tokenResponse.data;
    
    // Store tokens (use database in production)
    userTokens.set(user_id, {
      access_token,
      refresh_token,
      created_at: new Date()
    });

    // Redirect to dashboard
    res.redirect(`/dashboard.html?user_id=${user_id}`);
    
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).send('Authentication failed');
  }
});

// Get user's health data
app.get('/api/health-data/:userId', async (req, res) => {
  const { userId } = req.params;
  const userToken = userTokens.get(userId);
  
  if (!userToken) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    // Fetch multiple health metrics
    const [profile, activity, heartRate, sleep] = await Promise.all([
      fetchFitbitData('user/-/profile.json', userToken.access_token),
      fetchFitbitData('user/-/activities/date/today.json', userToken.access_token),
      fetchFitbitData('user/-/activities/heart/date/today/1d.json', userToken.access_token),
      fetchFitbitData('user/-/sleep/date/today.json', userToken.access_token)
    ]);

    res.json({
      profile: profile.user,
      activity: activity.summary,
      heartRate: heartRate['activities-heart'][0]?.value,
      sleep: sleep.sleep[0]
    });

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch health data' });
  }
});

// Combined health dashboard data (air quality + fitbit)
app.get('/api/combined-health/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get Fitbit data
    let fitbitData = null;
    const userToken = userTokens.get(userId);
    
    if (userToken) {
      const [activity, heartRate] = await Promise.all([
        fetchFitbitData('user/-/activities/date/today.json', userToken.access_token),
        fetchFitbitData('user/-/activities/heart/date/today/1d.json', userToken.access_token)
      ]);
      
      fitbitData = {
        steps: activity.summary.steps,
        calories: activity.summary.caloriesOut,
        heartRate: heartRate['activities-heart'][0]?.value?.restingHeartRate
      };
    }
    
    // Get latest air quality data
    const airQualityData = latestReading;
    
    // Combine both datasets
    res.json({
      fitbit: fitbitData,
      airQuality: airQualityData,
      combinedHealthScore: calculateCombinedHealthScore(fitbitData, airQualityData)
    });
    
  } catch (error) {
    console.error('Combined health data error:', error);
    res.status(500).json({ error: 'Failed to fetch combined health data' });
  }
});

// Helper function to make Fitbit API calls
async function fetchFitbitData(endpoint, accessToken) {
  const response = await axios.get(`https://api.fitbit.com/1/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
}

// Helper function to calculate combined health score
function calculateCombinedHealthScore(fitbitData, airQualityData) {
  if (!fitbitData && !airQualityData) return null;
  
  let score = 50; // Base score
  
  // Factor in air quality
  if (airQualityData) {
    score += (100 - airQualityData.healthScore) * 0.3; // Air quality impact
  }
  
  // Factor in activity level
  if (fitbitData && fitbitData.steps) {
    const stepScore = Math.min(fitbitData.steps / 10000, 1) * 20; // Up to 20 points for steps
    score += stepScore;
  }
  
  return Math.round(Math.max(0, Math.min(100, score)));
}
// END FITBIT

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