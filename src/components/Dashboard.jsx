// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router'; 
import { supabase } from '../supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Clock, Trophy, RefreshCw, BarChart2, Star, Target, CheckCircle, AlertTriangle, ArrowLeft, Activity, BrainCircuit } from 'lucide-react';

const Dashboard = ({ patientId }) => {
  const navigate = useNavigate();
  
  // --- REAL-TIME STATE ---
  const [isConnected, setIsConnected] = useState(false);
  const [liveReadingsCount, setLiveReadingsCount] = useState(0);
  const [sensorDataStream, setSensorDataStream] = useState([]); // For the Line Chart
  
  // --- LIVE AI STATE (Replaces Dummy Text & Heuristics) ---
  const [aiData, setAiData] = useState({
    posture: "Initializing ML...",
    status: "Analyzing",
    lastUpdated: ""
  });
  
  const [postureHistory, setPostureHistory] = useState({
    'Right Lateral': 0,
    'Left Lateral': 0,
    'Prone': 0,
    'Supine': 0
  });

  // --- SUPABASE REAL-TIME CONNECTIONS ---
  useEffect(() => {
    // 1. Fetch initial data to populate charts on load
    const fetchInitialData = async () => {
      // Get historical sensor voltages
      const { data: sensorData } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (sensorData) setSensorDataStream(sensorData.reverse());

      // Get the latest AI Prediction from the patients table
      const { data: patientData } = await supabase
        .from('patients')
        .select('posture, status, updated_at')
        .eq('patient_id', patientId)
        .single();

      if (patientData) {
        setAiData({
          posture: patientData.posture || 'Unknown',
          status: patientData.status || 'Normal',
          lastUpdated: new Date(patientData.updated_at).toLocaleTimeString()
        });
        setIsConnected(true);
      }
    };

    fetchInitialData();

    // 2. LISTEN TO RAW HARDWARE: ESP32 Voltage Stream
    const sensorSubscription = supabase
      .channel(`sensor_readings_${patientId}`)
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'sensor_readings',
          filter: `patient_id=eq.${patientId}`
        }, 
        (payload) => {
          setSensorDataStream((current) => [...current.slice(-19), payload.new]);
          setLiveReadingsCount(prev => prev + 1);
      })
      .subscribe();

    // 3. LISTEN TO AI BRAIN: Python ML Predictions
    const aiSubscription = supabase
      .channel(`ai_predictions_${patientId}`)
      .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'patients',
          filter: `patient_id=eq.${patientId}` 
        }, 
        (payload) => {
          const newPosture = payload.new.posture;
          
          setAiData({
            posture: newPosture,
            status: payload.new.status,
            lastUpdated: new Date().toLocaleTimeString()
          });

          // Update the Pie Chart History based on actual AI decisions
          setPostureHistory(prev => ({
            ...prev,
            [newPosture]: (prev[newPosture] || 0) + 1
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sensorSubscription);
      supabase.removeChannel(aiSubscription);
    };
  }, [patientId]);

  // Dynamically format the data for the Pie Chart based on real-time history
  const totalReadings = Object.values(postureHistory).reduce((a, b) => a + b, 0) || 1;
  const dynamicPieData = [
    { name: 'Right Lateral', value: Math.round((postureHistory['Right Lateral'] / totalReadings) * 100), color: '#f59e0b' },
    { name: 'Left Lateral', value: Math.round((postureHistory['Left Lateral'] / totalReadings) * 100), color: '#10b981' },
    { name: 'Prone', value: Math.round((postureHistory['Prone'] / totalReadings) * 100), color: '#ef4444' },
    { name: 'Supine', value: Math.round((postureHistory['Supine'] / totalReadings) * 100), color: '#6366f1' },
  ].filter(item => item.value > 0);

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
                    AI Engine Active
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
              <span>CURRENT AI STATE</span>
              <BrainCircuit size={16} className={isConnected ? "text-emerald-400 animate-pulse" : "text-slate-500"} />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">{aiData.posture}</span>
              <p className="text-xs text-slate-500 mt-1">Driven by ML Model</p>
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
              <span>RELIEF STATUS</span>
              <Activity size={16} className={aiData.status === 'Warning' ? "text-red-400" : "text-emerald-400"} />
            </div>
            <div className="mt-2">
              <span className={`text-2xl font-bold ${aiData.status === 'Warning' ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                {aiData.status}
              </span>
              <p className="text-xs text-slate-500 mt-1">Bed sore risk level</p>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start text-sm text-slate-400">
              <span>LIVE READINGS</span>
              <BarChart2 size={16} className="text-blue-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">{liveReadingsCount}</span>
              <p className="text-xs text-slate-500 mt-1">Data points processed</p>
            </div>
          </div>
        </div>

        {/* Middle Row: Line Chart (Raw Data) & Pie Chart (Calculated Data) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Live FSR Voltage Chart */}
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl lg:col-span-2">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider mb-4">ESP32 SENSOR TELEMETRY (RAW VOLTAGE)</h3>
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
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider mb-4">ML POSTURE BREAKDOWN</h3>
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
                  Waiting for ML data...
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

        {/* BOTTOM ROW: Live AI Engine Decisions (Replaces the Dummy Text) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-[#111c18] border border-emerald-900/50 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit size={100} />
            </div>
            <div className="flex items-center mb-4">
              <Target className="text-emerald-500 mr-3" />
              <h3 className="text-lg font-bold text-white tracking-wide">AI PREDICTION CORE</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6 relative z-10">
              The Machine Learning model is analyzing the live FSR matrix and has confidently determined the patient's current alignment.
            </p>
            <div className="bg-[#0B1120] border border-slate-800 p-6 rounded-lg text-center shadow-inner">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Live Output</p>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {aiData.posture}
              </h2>
            </div>
            <div className="mt-4 text-right text-xs text-slate-500 font-mono">
              Last Synced: {aiData.lastUpdated}
            </div>
          </div>

          <div className={`p-6 rounded-xl border transition-all duration-500 relative overflow-hidden ${
            aiData.status === 'Warning' 
              ? 'bg-[#1a1515] border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.15)]' 
              : 'bg-[#111827] border-slate-800'
          }`}>
             <div className="absolute top-0 right-0 p-4 opacity-10">
              {aiData.status === 'Warning' ? <AlertTriangle size={100} /> : <CheckCircle size={100} />}
            </div>
            <div className="flex items-center mb-4">
              {aiData.status === 'Warning' ? (
                <AlertTriangle className="text-red-500 mr-3 animate-pulse" />
              ) : (
                <CheckCircle className="text-blue-500 mr-3" />
              )}
              <h3 className="text-lg font-bold text-white tracking-wide">CLINICAL RISK ASSESSMENT</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6 relative z-10">
              Based on the duration and pressure distribution of the current posture, the system evaluates the risk of pressure ulcer formation.
            </p>
            <div className="bg-[#0B1120] border border-slate-800 p-6 rounded-lg text-center shadow-inner">
               <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">System Status</p>
               <h2 className={`text-3xl font-black tracking-wider ${
                  aiData.status === 'Warning' ? 'text-red-500 animate-pulse' : 'text-emerald-500'
               }`}>
                 {aiData.status.toUpperCase()}
               </h2>
            </div>
             <div className="mt-4 text-right text-xs text-slate-500 font-mono">
              Automated Monitor Active
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;