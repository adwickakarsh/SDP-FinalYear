// src/components/Auth.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../supabaseClient';
import { User, ShieldAlert, Loader2 } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [identifier, setIdentifier] = useState(''); // Patient ID or Admin Username
  const [secret, setSecret] = useState('');         // PIN or Masterkey
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ergonomic Fix: Clear inputs and errors when switching views
  const handleToggleView = (toAdmin) => {
    setIsAdmin(toAdmin);
    setIdentifier('');
    setSecret('');
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isAdmin) {
        // --- ADMIN LOGIN LOGIC ---
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('username', identifier)
          .eq('masterkey', secret)
          .single();

        if (error || !data) throw new Error('Invalid Admin Credentials. Please check your username and masterkey.');
        
        localStorage.setItem('userRole', 'admin');
        navigate('/admin-portal');

      } else {
        // --- PATIENT LOGIN LOGIC ---
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('patient_id', identifier)
          .eq('pin', secret)
          .single();

        if (error || !data) throw new Error('Invalid Patient ID or PIN. Please try again.');
        
        localStorage.setItem('userRole', 'patient');
        localStorage.setItem('patientId', data.patient_id);
        navigate(`/dashboard/${data.patient_id}`); 
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800 relative overflow-hidden">
        
        {/* Toggle Switch */}
        <div className="flex bg-slate-950 p-1 rounded-lg mb-8 border border-slate-800/50">
          <button 
            type="button"
            onClick={() => handleToggleView(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-md flex justify-center items-center transition-all duration-300 ${!isAdmin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            <User size={16} className="mr-2" /> Patient
          </button>
          <button 
            type="button"
            onClick={() => handleToggleView(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-md flex justify-center items-center transition-all duration-300 ${isAdmin ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            <ShieldAlert size={16} className="mr-2" /> Admin
          </button>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isAdmin ? 'System Administrator' : 'Patient Portal'}
        </h2>
        
        {/* Error Message Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm text-center animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Identifier Input */}
          <div>
            <label className="block text-slate-400 mb-1.5 text-sm font-medium">
              {isAdmin ? 'Admin Username' : 'Patient ID'}
            </label>
            <input 
              type="text" 
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={isAdmin ? "e.g., admin_master" : "e.g., PT-1024"}
              value={identifier}
              onChange={(e) => {
                // Ergonomic UX: Auto-uppercase patient IDs as they type
                const val = e.target.value;
                setIdentifier(isAdmin ? val : val.toUpperCase());
              }}
            />
          </div>

          {/* Secret Input */}
          <div>
            <label className="block text-slate-400 mb-1.5 text-sm font-medium">
              {isAdmin ? 'Masterkey (Password)' : '4-Digit PIN'}
            </label>
            <input 
              type="password" 
              disabled={isLoading}
              maxLength={isAdmin ? 50 : 4}
              // Ergonomic UX: Pull up number pad on mobile if it's a PIN
              inputMode={isAdmin ? "text" : "numeric"}
              pattern={isAdmin ? undefined : "[0-9]*"}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-widest"
              placeholder={isAdmin ? "••••••••" : "••••"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading || !identifier || !secret} // Disable if empty or loading
            className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 flex justify-center items-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed
              ${isAdmin 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Authenticating...
              </>
            ) : (
              'Secure Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;