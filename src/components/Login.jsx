// src/components/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Import your database connection

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
      // Ask Supabase to find a patient with this exact ID and PIN
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', patientId)
        .eq('pin', pin)
        .single(); // We only expect one exact match

      if (error || !data) {
        setError('Invalid Patient ID or PIN');
      } else {
        // Success! Log the user in and pass the ID to the dashboard
        onLogin(data.patient_id);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Patient Portal Login</h2>
        
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1 text-sm">Patient ID</label>
            <input 
              type="text" 
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., PT-1024"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value.toUpperCase())} // Auto-capitalize
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 text-sm">4-Digit PIN</label>
            <input 
              type="password" 
              maxLength="4"
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="****"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-3 px-4 rounded transition-colors flex justify-center items-center"
          >
            {isLoading ? 'Verifying...' : 'Access Live Data'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;