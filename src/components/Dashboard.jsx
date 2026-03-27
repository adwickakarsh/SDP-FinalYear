// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router'; 
import { supabase } from '../supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Clock, Trophy, RefreshCw, BarChart2, Star, Target, CheckCircle, AlertTriangle, ArrowLeft, Activity } from 'lucide-react';

const Dashboard = ({ patientId }) => {
  const navigate = useNavigate();
  
  // --- REAL-TIME STATE ---
  const [isConnected, setIsConnected] = useState(false);
  const [liveReadingsCount, setLiveReadingsCount] = useState(0);
  const [sensorDataStream, setSensorDataStream] = useState([]); // For the Line Chart
  const [currentPosture, setCurrentPosture] = useState('Supine');
  const [postureHistory, setPostureHistory] = useState({
    'Right Lateral': 0,
    'Left Lateral': 0,
    'Prone': 0,
    'Supine': 0
  });

  // --- TEMPORARY HEURISTIC ALGORITHM ---
  // This temporarily replaces your Python ML script so the dashboard looks alive.
  // It guesses posture based on which FSR is being pressed the hardest.
  const determinePosture = (chest, hips, left_shoulder, right_shoulder) => {
    if (left_shoulder > right_shoulder + 500 && left_shoulder > chest) return 'Left Lateral';
    if (right_shoulder > left_shoulder + 500 && right_shoulder > chest) return 'Right Lateral';
    if (chest > 2000 && hips > 2000) return 'Prone';
    return 'Supine'; // Default resting state
  };

  // --- SUPABASE REAL-TIME CONNECTION ---
  useEffect(() => {
    // 1. Fetch the last 20 readings on initial load
    const fetchInitialData = async () => {
      const { data } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data && data.length > 0) {
        setSensorDataStream(data.reverse());
        // Calculate initial posture from the very last reading
        const latest = data[data.length - 1];
        setCurrentPosture(determinePosture(latest.chest, latest.hips, latest.left_shoulder, latest.right_shoulder));
      }
    };

    fetchInitialData();

    // 2. Listen for live FSR data coming from the ESP32
    // From your Dashboard.jsx
const subscription = supabase
  .channel(`public:sensor_readings:patient_id=eq.${patientId}`)
  .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'sensor_readings',
      filter: `patient_id=eq.${patientId}`
    }, 
    (payload) => {
      // THIS RUNS INSTANTLY WHEN THE ESP32 SENDS DATA
      const newReading = payload.new;
      
      // Updates the Line Chart
      setSensorDataStream((current) => [...current, newReading]);
  })
  .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [patientId]);

  const onLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('patientId');
    navigate('/auth');
  };

  // Dynamically format the data for the Pie Chart based on real-time history
  const totalReadings = Object.values(postureHistory).reduce((a, b) => a + b, 0) || 1; // Prevent divide by zero
  const dynamicPieData = [
    { name: 'Right Lateral', value: Math.round((postureHistory['Right Lateral'] / totalReadings) * 100), color: '#f59e0b' },
    { name: 'Left Lateral', value: Math.round((postureHistory['Left Lateral'] / totalReadings) * 100), color: '#10b981' },
    { name: 'Prone', value: Math.round((postureHistory['Prone'] / totalReadings) * 100), color: '#ef4444' },
    { name: 'Supine', value: Math.round((postureHistory['Supine'] / totalReadings) * 100), color: '#6366f1' },
  ].filter(item => item.value > 0); // Only show postures that have actually occurred

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0B1120] text-slate-300 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-slate-900/50 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all border border-slate-700/50 flex items-center justify-center group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                Live Monitoring
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800/50">
                  ID: {patientId}
                </span>
                {isConnected && (
                  <span className="flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-800/30">
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Sensor Live
                  </span>
                )}
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">Real-time telemetry and posture analysis</p>
            </div>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start text-sm text-slate-400">
              <span>CURRENT STATE</span>
              <Activity size={16} className={isConnected ? "text-emerald-400 animate-pulse" : "text-slate-500"} />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">{currentPosture}</span>
              <p className="text-xs text-slate-500 mt-1">Live heuristic detection</p>
            </div>
          </div>
          
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start text-sm text-slate-400">
              <span>DOMINANT</span>
              <Trophy size={16} className="text-yellow-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">
                {dynamicPieData.length > 0 ? dynamicPieData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name : 'Calculating...'}
              </span>
              <p className="text-xs text-slate-500 mt-1">Most frequent posture</p>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start text-sm text-slate-400">
              <span>POSTURE CHANGES</span>
              <RefreshCw size={16} className="text-blue-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">Live</span>
              <p className="text-xs text-slate-500 mt-1">Awaiting ML integration</p>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start text-sm text-slate-400">
              <span>LIVE READINGS</span>
              <BarChart2 size={16} className="text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">{liveReadingsCount}</span>
              <p className="text-xs text-slate-500 mt-1">data points captured</p>
            </div>
          </div>
        </div>

        {/* Middle Row: Line Chart (Raw Data) & Pie Chart (Calculated Data) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Live FSR Voltage Chart (Takes up 2 columns) */}
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl lg:col-span-2">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider mb-4">LIVE SENSOR TELEMETRY (VOLTAGE)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensorDataStream}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="created_at" stroke="#475569" tick={false} />
                  <YAxis stroke="#475569" domain={[0, 4095]} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                  <Line type="monotone" dataKey="chest" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="hips" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="left_shoulder" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="right_shoulder" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 text-xs mt-4">
              <span className="text-blue-500 font-medium">● Chest</span>
              <span className="text-purple-500 font-medium">● Hips</span>
              <span className="text-emerald-500 font-medium">● Left Shoulder</span>
              <span className="text-amber-500 font-medium">● Right Shoulder</span>
            </div>
          </div>

          {/* Dynamic Posture Pie Chart */}
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider mb-4">DYNAMIC BREAKDOWN</h3>
            <div className="h-48">
              {dynamicPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dynamicPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                      formatter={(value) => `${value}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  Waiting for sensor data...
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2 mt-4 text-xs">
              {dynamicPieData.map((item) => (
                <div key={item.name} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* AI Recommendations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1a1515] border border-red-900/50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🛏️</span>
              <h3 className="text-lg font-bold text-white">Right Lateral (Right Side)</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Sleeping on your right side is a common posture. However, it can present specific challenges for certain bodily functions.
            </p>
            <div className="space-y-3">
              <div className="bg-red-950/40 border border-red-900/50 p-3 rounded flex items-start">
                <AlertTriangle size={16} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-200">Can exacerbate acid reflux due to stomach acid flowing back into the esophagus.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111c18] border border-green-900/50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <CheckCircle className="text-emerald-500 mr-3" />
              <h3 className="text-lg font-bold text-white">Left Lateral (Left Side)</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Transitioning to your left side is highly recommended. It offers distinct digestive advantages.
            </p>
            <div className="space-y-3">
              <div className="bg-emerald-950/40 border border-emerald-900/50 p-3 rounded flex items-start">
                <CheckCircle size={16} className="text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-emerald-200">Aids digestion by allowing gravity to help food move through the digestive tract.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;