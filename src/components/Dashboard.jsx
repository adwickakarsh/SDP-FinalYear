// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router'; 
import { supabase } from '../supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Clock, Trophy, RefreshCw, BarChart2, Star, Target, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

// --- Placeholder Data (Your Python ML will update these values later) ---
const initialPostureData = [
  { name: 'Right Lateral', value: 42.9, color: '#f59e0b', time: '3.4h' },
  { name: 'Left Lateral', value: 28.6, color: '#10b981', time: '2.2h' },
  { name: 'Prone', value: 14.3, color: '#ef4444', time: '1.1h' },
  { name: 'Supine', value: 14.3, color: '#6366f1', time: '1.1h' },
];

const timelineSegments = [
  { color: 'bg-indigo-500', width: '15%' },
  { color: 'bg-green-500', width: '25%' },
  { color: 'bg-amber-500', width: '20%' },
  { color: 'bg-red-500', width: '15%' },
  { color: 'bg-green-500', width: '15%' },
  { color: 'bg-amber-500', width: '10%' },
];

const Dashboard = ({ patientId }) => {
  const navigate = useNavigate();
  
  // State for live hardware data
  const [liveReadings, setLiveReadings] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // --- SUPABASE REAL-TIME CONNECTION ---
  useEffect(() => {
    // We listen to the database strictly for THIS patient's data
    const subscription = supabase
      .channel(`public:sensor_readings:patient_id=eq.${patientId}`)
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'sensor_readings',
          filter: `patient_id=eq.${patientId}`
        }, 
        (payload) => {
          setIsConnected(true);
          setLiveReadings((prev) => prev + 1);
          
          // *NOTE: Once your Python script is running, it will update a separate 
          // 'daily_summaries' table with the calculated posture percentages.
          // You would fetch and update the pie chart state here!
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

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0B1120] text-slate-300 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-slate-900/50 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all border border-slate-700/50 flex items-center justify-center group"
              aria-label="Go back"
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
                    Receiving Data
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
              <span>DURATION</span>
              <Clock size={16} />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">7h 48m</span>
              <p className="text-xs text-slate-500 mt-1">Estimated at 1 Hz</p>
            </div>
          </div>
          
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start text-sm text-slate-400">
              <span>DOMINANT</span>
              <Trophy size={16} className="text-yellow-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">Right Lateral</span>
              <p className="text-xs text-slate-500 mt-1">42.9% of session</p>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start text-sm text-slate-400">
              <span>POSTURE CHANGES</span>
              <RefreshCw size={16} className="text-blue-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">5</span>
              <p className="text-xs text-slate-500 mt-1">position shifts</p>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start text-sm text-slate-400">
              <span>LIVE READINGS</span>
              <BarChart2 size={16} className={isConnected ? "text-emerald-400 animate-pulse" : "text-slate-500"} />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">{28080 + liveReadings}</span>
              <p className="text-xs text-slate-500 mt-1">data points captured</p>
            </div>
          </div>
        </div>

        {/* Middle Row: Pie Chart & Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider mb-4">POSTURE BREAKDOWN</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={initialPostureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {initialPostureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 text-xs mt-2">
              {initialPostureData.map((item) => (
                <div key={item.name} className="flex items-center">
                  <span className="w-3 h-3 block mr-2" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider mb-6">BREAKDOWN DETAILS</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs text-slate-500 pb-2 border-b border-slate-800">
                <span>POSTURE</span>
                <div className="flex w-1/3 justify-between">
                  <span>TIME</span>
                  <span>%</span>
                </div>
              </div>
              {initialPostureData.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <span className="text-slate-200">{item.name}</span>
                  <div className="flex w-1/3 justify-between text-slate-400">
                    <span>{item.time}</span>
                    <span className="font-medium text-white">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Night Timeline */}
        <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl">
          <h3 className="text-xs font-semibold text-slate-400 tracking-wider mb-4">NIGHT TIMELINE</h3>
          <div className="h-8 w-full flex rounded overflow-hidden mb-2">
            {timelineSegments.map((segment, index) => (
              <div key={index} className={`h-full ${segment.color}`} style={{ width: segment.width }}></div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Sleep start</span>
            <span>Wake</span>
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
            <h4 className="text-xs font-semibold text-slate-500 tracking-wider mb-3">DISADVANTAGES</h4>
            <div className="space-y-3">
              <div className="bg-red-950/40 border border-red-900/50 p-3 rounded flex items-start">
                <AlertTriangle size={16} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-200">Can exacerbate acid reflux and heartburn due to stomach acid flowing back into the esophagus.</p>
              </div>
              <div className="bg-red-950/40 border border-red-900/50 p-3 rounded flex items-start">
                <AlertTriangle size={16} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-200">May put pressure on internal organs like the liver and lungs, potentially impacting their function.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111c18] border border-green-900/50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <CheckCircle className="text-emerald-500 mr-3" />
              <h3 className="text-lg font-bold text-white">Left Lateral (Left Side)</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Given your dominant right-side sleeping, transitioning to your left side is highly recommended. It offers distinct digestive advantages.
            </p>
            <h4 className="text-xs font-semibold text-slate-500 tracking-wider mb-3">BENEFITS</h4>
            <div className="space-y-3">
              <div className="bg-emerald-950/40 border border-emerald-900/50 p-3 rounded flex items-start">
                <CheckCircle size={16} className="text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-emerald-200">Aids digestion by allowing gravity to help food move through the digestive tract more efficiently.</p>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-900/50 p-3 rounded flex items-start">
                <CheckCircle size={16} className="text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-emerald-200">Improves circulation and lymphatic drainage, especially beneficial for the heart and spleen.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl flex flex-col justify-center">
             <div className="flex items-center mb-6">
              <Star className="text-yellow-500 mr-3" />
              <h3 className="text-lg font-bold text-white">Your Sleep Posture Score</h3>
            </div>
            <div className="text-center mb-4">
              <span className="text-6xl font-black text-yellow-500">6</span>
              <p className="text-slate-500 mt-1">out of 10</p>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 mb-4 overflow-hidden">
              <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-slate-400 text-center">Your score reflects a good amount of posture variety, but indicates room for improvement in dominant positions.</p>
          </div>

          <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl">
             <div className="flex items-center mb-4">
              <Target className="text-red-400 mr-3" />
              <h3 className="text-lg font-bold text-white">Tonight's Action</h3>
            </div>
            <div className="bg-indigo-950/30 border border-indigo-900/50 p-6 rounded-lg h-full flex items-center">
              <p className="text-indigo-200 leading-relaxed text-center w-full">
                Tonight, consciously try to initiate sleep on your <strong className="text-white">left side</strong> to harness its digestive and circulatory benefits.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;