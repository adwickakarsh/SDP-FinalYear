// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../supabaseClient';
import { ShieldAlert, Users, AlertTriangle, CheckCircle, Search, LogOut, ChevronRight } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('room', { ascending: true });

      if (!error && data) {
        setPatients(data);
      }
      setIsLoading(false);
    };

    fetchPatients();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/auth');
  };

  const filteredPatients = patients.filter(p => 
    p.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.room && p.room.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    // LIGHT BLUE BACKGROUND
    <div className="min-h-[calc(100vh-5rem)] bg-[#B4CDDB] text-[#1A5A55] font-sans flex flex-col pt-10">
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Patient Grid Section - SKIN WHITE */}
        <div className="bg-[#FDF7F0] border border-[#1A5A55]/20 rounded-2xl overflow-hidden flex flex-col shadow-xl shadow-[#1A5A55]/5">
          
          <div className="p-5 border-b border-[#1A5A55]/10 flex justify-between items-center bg-white/50">
            <h2 className="text-xl font-black text-[#1A5A55] flex items-center gap-2">
              <Users size={24} className="text-[#1A5A55]/70" /> Connected Beds
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A5A55]/40 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search ID or Room..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-[#1A5A55]/20 rounded-lg pl-9 pr-4 py-2 text-sm text-[#1A5A55] placeholder:text-[#1A5A55]/40 focus:outline-none focus:border-[#1A5A55] focus:ring-1 focus:ring-[#1A5A55] w-64 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto bg-[#FDF7F0]">
            {isLoading ? (
              <div className="p-12 text-center text-[#1A5A55]/50 font-medium animate-pulse">Synchronizing with cloud database...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 shadow-sm border-b border-[#1A5A55]/10">
                  <tr className="text-xs text-[#1A5A55]/60 uppercase tracking-widest">
                    <th className="p-5 font-bold">Room / Bed</th>
                    <th className="p-5 font-bold">Patient ID</th>
                    <th className="p-5 font-bold">AI System Status</th>
                    <th className="p-5 font-bold text-right">Telemetry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A5A55]/5">
                  {filteredPatients.map((patient, index) => (
                    <tr 
                      key={index} 
                      onClick={() => navigate(`/dashboard/${patient.patient_id}`)}
                      className="hover:bg-[#1A5A55]/5 transition-colors cursor-pointer group"
                    >
                      <td className="p-5 font-black text-[#1A5A55]">{patient.room}</td>
                      <td className="p-5 text-[#1A5A55]/70 font-medium">{patient.patient_id}</td>
                      <td className="p-5">
                        {patient.status === 'Normal' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                            Stable / Resting
                          </span>
                        )}
                        {patient.status === 'Warning' && (
                          <div className="flex flex-col items-start">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm w-max mb-1">
                              Review Required
                            </span>
                            <span className="text-xs text-amber-700/80 font-medium">{patient.alert_message}</span>
                          </div>
                        )}
                        {patient.status === 'Critical' && (
                          <div className="flex flex-col items-start">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 shadow-sm w-max mb-1 animate-pulse">
                              Critical Alert
                            </span>
                            <span className="text-xs text-red-600 font-medium">{patient.alert_message}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end items-center text-[#1A5A55]/50 group-hover:text-[#1A5A55] transition-colors">
                          <span className="text-sm font-bold mr-1">View</span>
                          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!isLoading && filteredPatients.length === 0 && (
              <div className="p-12 text-center text-[#1A5A55]/50 font-medium">
                No active patients found matching your search criteria.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;