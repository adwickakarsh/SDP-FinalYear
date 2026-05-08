// src/components/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; 

const Login = ({ onLogin }) => {
  const [patientId, setPatientId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', patientId)
        .eq('pin', pin)
        .single(); 

      if (error || !data) {
        setError('Invalid Patient ID or PIN');
      } else {
        onLogin(data.patient_id);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // LIGHT BLUE BACKGROUND
    <div className="min-h-screen bg-[#B4CDDB] flex items-center justify-center p-4">
      
      {/* SKIN-WHITE LOGIN CARD */}
      <div className="bg-[#FDF7F0] p-8 rounded-2xl shadow-2xl shadow-[#1A5A55]/10 w-full max-w-md border border-[#1A5A55]/20">
        
        {/* DEEP GREEN TEXT */}
        <h2 className="text-2xl font-bold text-[#1A5A55] mb-6 text-center">Patient Portal Login</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg mb-4 text-sm text-center font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[#1A5A55]/80 mb-1.5 text-sm font-semibold tracking-wide">
              Patient ID
            </label>
            <input 
              type="text" 
              className="w-full bg-white border border-[#1A5A55]/20 rounded-lg p-3 text-[#1A5A55] placeholder:text-[#1A5A55]/40 focus:outline-none focus:border-[#1A5A55] focus:ring-1 focus:ring-[#1A5A55] transition-all"
              placeholder="e.g., PT-1024"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value.toUpperCase())} 
            />
          </div>
          <div>
            <label className="block text-[#1A5A55]/80 mb-1.5 text-sm font-semibold tracking-wide">
              4-Digit PIN
            </label>
            <input 
              type="password" 
              maxLength="4"
              className="w-full bg-white border border-[#1A5A55]/20 rounded-lg p-3 text-[#1A5A55] placeholder:text-[#1A5A55]/40 focus:outline-none focus:border-[#1A5A55] focus:ring-1 focus:ring-[#1A5A55] transition-all"
              placeholder="****"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>
          
          {/* DEEP GREEN BUTTON WITH SKIN-WHITE TEXT */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 bg-[#1A5A55] hover:bg-[#1A5A55]/90 disabled:bg-[#1A5A55]/60 text-[#FDF7F0] font-bold py-3.5 px-4 rounded-lg transition-all flex justify-center items-center shadow-lg shadow-[#1A5A55]/20"
          >
            {isLoading ? 'Verifying...' : 'Access Live Data'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;