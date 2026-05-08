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
    // LIGHT BLUE BACKGROUND
    <div className="min-h-[calc(100vh-5rem)] bg-[#B4CDDB] flex items-center justify-center p-4 font-sans">
      
      {/* SKIN-WHITE CARD */}
      <div className="bg-[#FDF7F0] p-8 rounded-2xl shadow-2xl shadow-[#1A5A55]/10 w-full max-w-md border border-[#1A5A55]/20 relative overflow-hidden">
        
        {/* Toggle Switch */}
        <div className="flex bg-white p-1 rounded-lg mb-8 border border-[#1A5A55]/10 shadow-inner">
          <button 
            type="button"
            onClick={() => handleToggleView(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-md flex justify-center items-center transition-all duration-300 ${!isAdmin ? 'bg-[#1A5A55] text-[#FDF7F0] shadow-md' : 'text-[#1A5A55]/60 hover:text-[#1A5A55] hover:bg-[#1A5A55]/5'}`}
          >
            <User size={16} className="mr-2" /> Patient
          </button>
          <button 
            type="button"
            onClick={() => handleToggleView(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-md flex justify-center items-center transition-all duration-300 ${isAdmin ? 'bg-[#1A5A55] text-[#FDF7F0] shadow-md' : 'text-[#1A5A55]/60 hover:text-[#1A5A55] hover:bg-[#1A5A55]/5'}`}
          >
            <ShieldAlert size={16} className="mr-2" /> Admin
          </button>
        </div>

        <h2 className="text-2xl font-black text-[#1A5A55] mb-6 text-center tracking-wide">
          {isAdmin ? 'System Administrator' : 'Patient Portal'}
        </h2>
        
        {/* Error Message Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 font-medium p-3 rounded-lg mb-6 text-sm text-center animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Identifier Input */}
          <div>
            <label className="block text-[#1A5A55]/80 mb-1.5 text-sm font-bold">
              {isAdmin ? 'Admin Username' : 'Patient ID'}
            </label>
            <input 
              type="text" 
              disabled={isLoading}
              className="w-full bg-white border border-[#1A5A55]/20 rounded-lg p-3 text-[#1A5A55] placeholder:text-[#1A5A55]/40 focus:outline-none focus:border-[#1A5A55] focus:ring-1 focus:ring-[#1A5A55] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              placeholder={isAdmin ? "e.g., admin_master" : "e.g., PT-1024"}
              value={identifier}
              onChange={(e) => {
                const val = e.target.value;
                setIdentifier(isAdmin ? val : val.toUpperCase());
              }}
            />
          </div>

          {/* Secret Input */}
          <div>
            <label className="block text-[#1A5A55]/80 mb-1.5 text-sm font-bold">
              {isAdmin ? 'Masterkey (Password)' : '4-Digit PIN'}
            </label>
            <input 
              type="password" 
              disabled={isLoading}
              maxLength={isAdmin ? 50 : 4}
              inputMode={isAdmin ? "text" : "numeric"}
              pattern={isAdmin ? undefined : "[0-9]*"}
              className="w-full bg-white border border-[#1A5A55]/20 rounded-lg p-3 text-[#1A5A55] placeholder:text-[#1A5A55]/40 focus:outline-none focus:border-[#1A5A55] focus:ring-1 focus:ring-[#1A5A55] transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-widest shadow-sm"
              placeholder={isAdmin ? "••••••••" : "••••"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading || !identifier || !secret} 
            className="w-full font-bold py-3.5 px-4 rounded-lg transition-all duration-300 flex justify-center items-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#1A5A55] hover:bg-[#1A5A55]/90 text-[#FDF7F0] shadow-lg shadow-[#1A5A55]/20"
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