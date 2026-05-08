// src/components/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router';
import { Activity, Shield, Microchip, BrainCircuit, LayoutDashboard, Zap } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    // min-h-screen for mobile, but strictly h-screen and overflow-hidden for desktop (lg)
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#B4CDDB] text-[#1A5A55] flex flex-col pt-20 font-sans">

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 pb-6">
        
        {/* SKIN-WHITE PILL WITH DEEP GREEN TEXT */}
        <div className="inline-flex items-center space-x-2 bg-[#FDF7F0] text-[#1A5A55] px-4 py-1.5 rounded-full mb-5 border border-[#1A5A55]/20 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold tracking-wide uppercase">IoT Prototype Online</span>
        </div>
        
        {/* PPT Aligned Heading (Slightly reduced text size to fit laptops) */}
        <h1 className="text-4xl lg:text-6xl font-black text-[#1A5A55] mb-4 leading-tight max-w-5xl">
          AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A5A55] to-[#2B7A75]">Bedsore Prevention</span> System.
        </h1>
        
        {/* PPT Aligned Subheading */}
        <p className="text-base lg:text-lg text-[#1A5A55]/80 max-w-3xl mb-6 font-medium">
          A non-intrusive monitoring layer utilizing Force Sensitive Resistors (FSRs) to map pressure in real-time. Featuring automated Machine Learning risk assessment and instant caregiver alerts.
        </p>

        {/* PPT Slide 11: Performance Stats */}
        <div className="flex flex-wrap justify-center gap-3 lg:gap-6 mb-8">
          <div className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-lg border border-[#1A5A55]/10">
            <BrainCircuit className="text-[#1A5A55] w-4 h-4" />
            <span className="text-sm font-bold text-[#1A5A55]">98% Model Accuracy</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-lg border border-[#1A5A55]/10">
            <Zap className="text-[#1A5A55] w-4 h-4" />
            <span className="text-sm font-bold text-[#1A5A55]">0.8s Cloud Latency</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-lg border border-[#1A5A55]/10">
            <Activity className="text-[#1A5A55] w-4 h-4" />
            <span className="text-sm font-bold text-[#1A5A55]">1Hz Telemetry</span>
          </div>
        </div>

        {/* 3 FEATURE CARDS (Aligned with PPT Methodology) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl w-full text-left">
          
          <div className="bg-[#FDF7F0] border border-[#1A5A55]/20 shadow-lg shadow-[#1A5A55]/5 p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-[#1A5A55]/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Microchip className="text-[#1A5A55] w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#1A5A55] mb-2">ESP32 & FSR Matrix</h3>
            <p className="text-[#1A5A55]/70 text-xs font-medium leading-relaxed">
              Four high-precision sensors strategically placed to detect weight distribution. The ESP32 handles sensor polling and anti-crosstalk logic before Wi-Fi transmission.
            </p>
          </div>
          
          <div className="bg-[#FDF7F0] border border-[#1A5A55]/20 shadow-lg shadow-[#1A5A55]/5 p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-[#1A5A55]/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <BrainCircuit className="text-[#1A5A55] w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#1A5A55] mb-2">Random Forest Engine</h3>
            <p className="text-[#1A5A55]/70 text-xs font-medium leading-relaxed">
              An ensemble of 100 Decision Trees built in Python automatically classifies live patient alignment into Supine, Prone, or Lateral states to determine relief status.
            </p>
          </div>
          
          <div className="bg-[#FDF7F0] border border-[#1A5A55]/20 shadow-lg shadow-[#1A5A55]/5 p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-[#1A5A55]/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <LayoutDashboard className="text-[#1A5A55] w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#1A5A55] mb-2">Supabase Integration</h3>
            <p className="text-[#1A5A55]/70 text-xs font-medium leading-relaxed">
              High-speed PostgreSQL database capturing real-time telemetry. Caregivers receive instant UI updates on the React dashboard without needing to refresh.
            </p>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default LandingPage;