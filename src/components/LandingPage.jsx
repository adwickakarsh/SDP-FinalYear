import React from 'react';
import { useNavigate } from 'react-router';
import { Activity, Shield, Moon } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6 mt-12">
        <div className="inline-flex items-center space-x-2 bg-blue-900/30 text-blue-400 px-4 py-2 rounded-full mb-8 border border-blue-800/50">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          <span className="text-sm font-semibold">Live System Active</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight max-w-4xl">
          Non-Invasive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Smart Sleep</span> Monitoring.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12">
          Advanced posture tracking, continuous respiration analysis, and AI-driven clinical insights—powered purely by intelligent force-sensing technology. No wearables required.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left mt-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <Moon className="text-indigo-400 w-10 h-10 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Zero Intrusiveness</h3>
            <p className="text-slate-400 text-sm">Sensors remain completely hidden beneath the mattress, ensuring natural sleep is never disrupted.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <Activity className="text-emerald-400 w-10 h-10 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Micro-Movement AI</h3>
            <p className="text-slate-400 text-sm">High-frequency data sampling capable of isolating respiration rates and restlessness patterns.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <Shield className="text-blue-400 w-10 h-10 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Clinical Dashboard</h3>
            <p className="text-slate-400 text-sm">Secure, role-based access providing real-time telemetry and historical analysis for healthcare providers.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;