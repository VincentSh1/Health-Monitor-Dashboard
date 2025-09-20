import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Thermometer, Wind, Droplets, Activity, AlertTriangle, CheckCircle, Wifi } from 'lucide-react';

const HomeHealthMonitor = () => {
  const [sensorData, setSensorData] = useState({
    pm25: 12,
    co2: 420,
    voc: 0.8,
    temperature: 22.5,
    humidity: 45,
    healthScore: 82
  });

  const [isConnected, setIsConnected] = useState(true);
  const [historicalData, setHistoricalData] = useState([
    { time: '00:00', pm25: 15, co2: 450, voc: 0.9, healthScore: 78 },
    { time: '04:00', pm25: 12, co2: 420, voc: 0.7, healthScore: 85 },
    { time: '08:00', pm25: 18, co2: 480, voc: 1.2, healthScore: 72 },
    { time: '12:00', pm25: 22, co2: 520, voc: 1.5, healthScore: 68 },
    { time: '16:00', pm25: 14, co2: 440, voc: 0.8, healthScore: 82 },
    { time: '20:00', pm25: 12, co2: 420, voc: 0.6, healthScore: 88 },
  ]);

  // Fetch real sensor data from backend
  useEffect(() => {
    // Function to fetch latest sensor data
    const fetchSensorData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/sensors/latest');
        if (response.ok) {
          const data = await response.json();
          setSensorData({
            pm25: parseFloat(data.pm25) || 0,
            co2: parseFloat(data.co2) || 0,
            voc: parseFloat(data.voc) || 0,
            temperature: parseFloat(data.temperature) || 0,
            humidity: parseFloat(data.humidity) || 0,
            healthScore: parseInt(data.healthScore) || 0
          });
          setIsConnected(true);
        } else {
          console.log('No sensor data available');
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        setIsConnected(false);
      }
    };

    // Function to fetch historical data for charts
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/sensors/history');
        if (response.ok) {
          const data = await response.json();
          setHistoricalData(data);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    // Function to check connection status
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          const data = await response.json();
          setIsConnected(data.status === 'connected');
        }
      } catch (error) {
        setIsConnected(false);
      }
    };

    // Initial fetch
    fetchSensorData();
    fetchHistoricalData();
    checkConnection();

    // Set up intervals for real-time updates
    const sensorInterval = setInterval(fetchSensorData, 5000); // Every 5 seconds
    const historyInterval = setInterval(fetchHistoricalData, 30000); // Every 30 seconds
    const connectionInterval = setInterval(checkConnection, 10000); // Every 10 seconds

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(sensorInterval);
      clearInterval(historyInterval);
      clearInterval(connectionInterval);
    };
  }, []);

  const getHealthStatus = (score) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-green-500', bg: 'bg-green-50' };
    if (score >= 60) return { text: 'Good', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (score >= 40) return { text: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-50' };
    return { text: 'Poor', color: 'text-red-500', bg: 'bg-red-50' };
  };

  const getAirQualityLevel = (pm25) => {
    if (pm25 <= 12) return { level: 'Good', color: 'text-green-500' };
    if (pm25 <= 35) return { level: 'Moderate', color: 'text-yellow-500' };
    if (pm25 <= 55) return { level: 'Unhealthy', color: 'text-orange-500' };
    return { level: 'Hazardous', color: 'text-red-500' };
  };

  const healthStatus = getHealthStatus(sensorData.healthScore);
  const airQuality = getAirQualityLevel(sensorData.pm25);

  const SensorCard = ({ icon: Icon, title, value, unit, status, description }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        {status && <span className={`text-sm font-medium ${status.color}`}>{status.level}</span>}
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          <span className="text-gray-500">{unit}</span>
        </div>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Home Health Monitor</h1>
            <p className="text-gray-600">Real-time environmental health tracking for your home</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        {/* Health Score Card */}
        <div className={`${healthStatus.bg} rounded-2xl p-8 mb-8 border-2 border-opacity-20`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Health Score</h2>
              <p className="text-gray-600 mb-4">Based on air quality, temperature, and humidity levels</p>
              <div className="flex items-center space-x-4">
                <div className="text-6xl font-bold text-gray-900">{Math.round(sensorData.healthScore)}</div>
                <div>
                  <div className={`text-2xl font-semibold ${healthStatus.color}`}>{healthStatus.text}</div>
                  <div className="text-gray-600">out of 100</div>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              {healthStatus.text === 'Excellent' ? 
                <CheckCircle className="h-24 w-24 text-green-500" /> :
                <Activity className="h-24 w-24 text-blue-500" />
              }
            </div>
          </div>
        </div>

        {/* Sensor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <SensorCard
            icon={Wind}
            title="PM2.5 Particles"
            value={sensorData.pm25.toFixed(1)}
            unit="μg/m³"
            status={airQuality}
            description="Fine particulate matter concentration"
          />
          <SensorCard
            icon={Activity}
            title="CO₂ Level"
            value={Math.round(sensorData.co2)}
            unit="ppm"
            description="Carbon dioxide concentration"
          />
          <SensorCard
            icon={AlertTriangle}
            title="VOC Index"
            value={sensorData.voc.toFixed(2)}
            unit="index"
            description="Volatile organic compounds"
          />
          <SensorCard
            icon={Thermometer}
            title="Temperature"
            value={sensorData.temperature.toFixed(1)}
            unit="°C"
            description="Ambient temperature"
          />
          <SensorCard
            icon={Droplets}
            title="Humidity"
            value={Math.round(sensorData.humidity)}
            unit="%"
            description="Relative humidity level"
          />
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Sync Wearables
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                Export Data
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Health Score Trend */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Health Score Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="healthScore" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.1}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Air Quality Metrics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Air Quality Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pm25" stroke="#EF4444" strokeWidth={2} name="PM2.5" />
                <Line type="monotone" dataKey="co2" stroke="#10B981" strokeWidth={2} name="CO₂" />
                <Line type="monotone" dataKey="voc" stroke="#F59E0B" strokeWidth={2} name="VOC" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Insights */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Health Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Air Quality</h4>
              <p className="text-blue-700 text-sm">
                Your current PM2.5 levels are {airQuality.level.toLowerCase()}. Consider using an air purifier during high pollution days.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Temperature</h4>
              <p className="text-green-700 text-sm">
                Room temperature is optimal for sleep and productivity. Maintain between 20-24°C for best comfort.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Wearable Sync</h4>
              <p className="text-purple-700 text-sm">
                Connect your fitness tracker to correlate environmental data with your health metrics and sleep quality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHealthMonitor;