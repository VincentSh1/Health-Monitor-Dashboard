import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Thermometer, Wind, Droplets, Activity, AlertTriangle, CheckCircle, Wifi, LayoutDashboard, User, LogOut, Settings, Database, Bell, History, Menu, X, Eye, EyeOff, Heart, Watch } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // For demo purposes, accept any valid email/password combination
      const userData = {
        name: 'Vincent Shi',
        email: formData.email,
        id: '123'
      };
      onLogin(userData);
      setIsLoading(false);
    }, 1500);
  };

  const handleDemoLogin = () => {
    const demoUser = {
      name: 'Vincent Shi',
      email: 'vincent@healthmonitor.com',
      id: 'demo123'
    };
    onLogin(demoUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-blue-200">Sign in to your Health Monitor</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 border ${
                  errors.email ? 'border-red-400' : 'border-white/30'
                } rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 bg-white/10 border ${
                    errors.password ? 'border-red-400' : 'border-white/30'
                  } rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-blue-200">Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-300 hover:text-white transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Login */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <button
              onClick={handleDemoLogin}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl border border-white/30 transition-all duration-200 hover:border-white/50"
            >
              Try Demo Login
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-blue-200 text-sm">
              Don't have an account?{' '}
              <button className="text-blue-300 hover:text-white font-medium transition-colors">
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <HomeHealthMonitor user={user} onLogout={handleLogout} />;
};

const HomeHealthMonitor = ({ user, onLogout }) => {
  const [sensorData, setSensorData] = useState({
    pm25: 12,
    co2: 420,
    voc: 0.8,
    temperature: 22.5,
    humidity: 45,
    healthScore: 82
  });

  const [isConnected, setIsConnected] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fitbitConnected, setFitbitConnected] = useState(false);
  const [fitbitData, setFitbitData] = useState({
    heartRate: [],
    steps: [],
    sleep: [],
    calories: []
  });
  const [showFitbitDemo, setShowFitbitDemo] = useState(false);
  const [historicalData, setHistoricalData] = useState([
    { time: '00:00', pm25: 15, co2: 450, voc: 0.9, healthScore: 78 },
    { time: '04:00', pm25: 12, co2: 420, voc: 0.7, healthScore: 85 },
    { time: '08:00', pm25: 18, co2: 480, voc: 1.2, healthScore: 72 },
    { time: '12:00', pm25: 22, co2: 520, voc: 1.5, healthScore: 68 },
    { time: '16:00', pm25: 14, co2: 440, voc: 0.8, healthScore: 82 },
    { time: '20:00', pm25: 12, co2: 420, voc: 0.6, healthScore: 88 },
  ]);

  // Demo Fitbit data
  const generateDemoFitbitData = () => {
    const heartRateData = [
      { time: '00:00', heartRate: 65, zone: 'Resting' },
      { time: '06:00', heartRate: 72, zone: 'Fat Burn' },
      { time: '09:00', heartRate: 95, zone: 'Cardio' },
      { time: '12:00', heartRate: 78, zone: 'Fat Burn' },
      { time: '15:00', heartRate: 85, zone: 'Fat Burn' },
      { time: '18:00', heartRate: 110, zone: 'Cardio' },
      { time: '21:00', heartRate: 68, zone: 'Resting' },
      { time: '23:00', heartRate: 62, zone: 'Resting' }
    ];

    const stepsData = [
      { time: '06:00', steps: 0, cumulative: 0 },
      { time: '08:00', steps: 1200, cumulative: 1200 },
      { time: '10:00', steps: 800, cumulative: 2000 },
      { time: '12:00', steps: 1500, cumulative: 3500 },
      { time: '14:00', steps: 600, cumulative: 4100 },
      { time: '16:00', steps: 900, cumulative: 5000 },
      { time: '18:00', steps: 1800, cumulative: 6800 },
      { time: '20:00', steps: 400, cumulative: 7200 },
      { time: '22:00', steps: 200, cumulative: 7400 }
    ];

    const sleepData = [
      { date: 'Last 7 Days', deep: 1.2, light: 4.8, rem: 1.5, awake: 0.5, total: 8.0 },
      { date: '6 Days Ago', deep: 1.5, light: 5.2, rem: 1.8, awake: 0.3, total: 8.8 },
      { date: '5 Days Ago', deep: 0.9, light: 4.5, rem: 1.2, awake: 0.7, total: 7.3 },
      { date: '4 Days Ago', deep: 1.8, light: 5.5, rem: 2.0, awake: 0.2, total: 9.5 },
      { date: '3 Days Ago', deep: 1.3, light: 4.9, rem: 1.6, awake: 0.4, total: 8.2 },
      { date: '2 Days Ago', deep: 1.1, light: 4.2, rem: 1.4, awake: 0.6, total: 7.3 },
      { date: 'Yesterday', deep: 1.6, light: 5.8, rem: 1.9, awake: 0.3, total: 9.6 }
    ];

    const caloriesData = [
      { time: '00:00', calories: 0, active: 0 },
      { time: '06:00', calories: 420, active: 0 },
      { time: '09:00', calories: 650, active: 180 },
      { time: '12:00', calories: 980, active: 280 },
      { time: '15:00', calories: 1200, active: 350 },
      { time: '18:00', calories: 1650, active: 580 },
      { time: '21:00', calories: 1920, active: 680 },
      { time: '23:59', calories: 2150, active: 750 }
    ];

    return {
      heartRate: heartRateData,
      steps: stepsData,
      sleep: sleepData,
      calories: caloriesData
    };
  };

  const handleFitbitConnect = () => {
    // In a real implementation, this would redirect to Fitbit OAuth
    // For now, we'll simulate a connection
    alert('In a real app, this would redirect to Fitbit OAuth. For demo purposes, use the Demo button instead.');
  };

  const handleFitbitDemo = () => {
    setFitbitData(generateDemoFitbitData());
    setShowFitbitDemo(true);
    setFitbitConnected(false); // Keep as false since it's demo data
  };

  // Fetch real sensor data from backend
  useEffect(() => {
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
    const sensorInterval = setInterval(fetchSensorData, 5000);
    const historyInterval = setInterval(fetchHistoricalData, 30000);
    const connectionInterval = setInterval(checkConnection, 10000);

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

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fitbit', label: 'Fitbit Health', icon: Watch },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'data', label: 'Data Export', icon: Database },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleSidebarClick = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
  };

  const SidebarItem = ({ item, isActive, onClick }) => {
    const Icon = item.icon;
    return (
      <button
        onClick={() => onClick(item.id)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{item.label}</span>
      </button>
    );
  };

  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-screen w-64 transform transition-transform duration-300 ease-in-out z-50 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 p-4`}>
      <div className="flex flex-col h-full bg-gray-800 rounded-2xl shadow-xl">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Health Monitor</h1>
              <p className="text-gray-400 text-sm">Dashboard</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <SidebarItem 
              key={item.id} 
              item={item} 
              isActive={activeSection === item.id}
              onClick={handleSidebarClick}
            />
          ))}
        </div>

        <div className="p-4 border-t border-gray-700 mt-auto">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{user.name}</p>
              <p className="text-gray-400 text-xs">{user.email}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

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

  const ProfileSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              defaultValue={user.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              defaultValue={user.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const SettingsSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Frequency</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Every 5 seconds</option>
                <option>Every 10 seconds</option>
                <option>Every 30 seconds</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DataExportSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Data Export</h2>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600 mb-6">Export your sensor data for analysis.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
            <Database className="h-6 w-6 mx-auto mb-2" />
            Export CSV
          </button>
          <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors">
            <Database className="h-6 w-6 mx-auto mb-2" />
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );

  const FitbitSection = () => {
    if (!fitbitConnected && !showFitbitDemo) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Fitbit Health</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Watch className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect Your Fitbit</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Connect your Fitbit account to track your health metrics alongside environmental data for a complete wellness picture.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleFitbitConnect}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Watch className="h-5 w-5" />
                  <span>Connect Fitbit Account</span>
                </button>
                <button
                  onClick={handleFitbitDemo}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Activity className="h-5 w-5" />
                  <span>View Demo Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Fitbit Data</h2>
          {showFitbitDemo && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Demo Mode
            </div>
          )}
        </div>

        {/* Health Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Heart Rate</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  {fitbitData.heartRate.length > 0 ? fitbitData.heartRate[fitbitData.heartRate.length - 1].heartRate : '--'}
                </span>
                <span className="text-gray-500">bpm</span>
              </div>
              <p className="text-sm text-gray-600">
                Current: {fitbitData.heartRate.length > 0 ? fitbitData.heartRate[fitbitData.heartRate.length - 1].zone : 'No data'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Steps Today</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  {fitbitData.steps.length > 0 ? fitbitData.steps[fitbitData.steps.length - 1].cumulative.toLocaleString() : '--'}
                </span>
                <span className="text-gray-500">steps</span>
              </div>
              <p className="text-sm text-gray-600">Goal: 10,000 steps</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Thermometer className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Calories</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  {fitbitData.calories.length > 0 ? fitbitData.calories[fitbitData.calories.length - 1].calories.toLocaleString() : '--'}
                </span>
                <span className="text-gray-500">cal</span>
              </div>
              <p className="text-sm text-gray-600">
                Active: {fitbitData.calories.length > 0 ? fitbitData.calories[fitbitData.calories.length - 1].active : '--'} cal
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Last Sleep</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  {fitbitData.sleep.length > 0 ? fitbitData.sleep[fitbitData.sleep.length - 1].total : '--'}
                </span>
                <span className="text-gray-500">hrs</span>
              </div>
              <p className="text-sm text-gray-600">
                Deep: {fitbitData.sleep.length > 0 ? fitbitData.sleep[fitbitData.sleep.length - 1].deep : '--'}h
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Heart Rate Today</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={fitbitData.heartRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[50, 130]} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="heartRate" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.1}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Steps Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={fitbitData.steps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.1}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Sleep Pattern (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={fitbitData.sleep}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="deep" 
                  stackId="1"
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  name="Deep Sleep"
                />
                <Area 
                  type="monotone" 
                  dataKey="rem" 
                  stackId="1"
                  stroke="#06B6D4" 
                  fill="#06B6D4" 
                  name="REM Sleep"
                />
                <Area 
                  type="monotone" 
                  dataKey="light" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981" 
                  name="Light Sleep"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Calories Burned</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fitbitData.calories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Total Calories"
                />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  name="Active Calories"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {showFitbitDemo && (
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Demo Data Active</h3>
                <p className="text-blue-700 text-sm">This is sample Fitbit data for demonstration purposes.</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleFitbitConnect}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Connect Real Account
              </button>
              <button
                onClick={() => {
                  setShowFitbitDemo(false);
                  setFitbitData({ heartRate: [], steps: [], sleep: [], calories: [] });
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Clear Demo
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'settings':
        return <SettingsSection />;
      case 'data':
        return <DataExportSection />;
      case 'fitbit':
        return <FitbitSection />;
      case 'history':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Historical Data</h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="healthScore" stroke="#3B82F6" strokeWidth={3} name="Health Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Alert Notifications</h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600 mb-4">Recent alerts from your health monitoring system.</p>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                  <p className="text-yellow-800">PM2.5 levels elevated</p>
                  <p className="text-yellow-600 text-sm">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
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
                  <button 
                    onClick={() => setActiveSection('fitbit')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Fitbit Data
                  </button>
                  <button 
                    onClick={() => setActiveSection('data')}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Export Data
                  </button>
                  <button 
                    onClick={() => setActiveSection('settings')}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Settings
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar />
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content with left margin for sidebar */}
      <div className="lg:ml-64">
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Health Monitor</h1>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <Wifi className="h-3 w-3" />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {activeSection === 'dashboard' ? 'Home Health Monitor' : 
                 sidebarItems.find(item => item.id === activeSection)?.label}
              </h1>
              <p className="text-gray-600">
                {activeSection === 'dashboard' ? 'Real-time environmental health tracking for your home' :
                 'Manage your health monitoring system'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;