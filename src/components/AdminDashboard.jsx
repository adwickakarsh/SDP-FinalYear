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
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 text-slate-200 font-sans flex flex-col">
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Patient Grid Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl">
          
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
            <h2 className="text-lg font-bold text-white">Connected Beds</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search ID or Room..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400 animate-pulse">Synchronizing with cloud database...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="p-4 font-semibold">Room / Bed</th>
                    <th className="p-4 font-semibold">Patient ID</th>
                    <th className="p-4 font-semibold">AI System Status</th>
                    <th className="p-4 font-semibold text-right">Telemetry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredPatients.map((patient, index) => (
                    <tr 
                      key={index} 
                      onClick={() => navigate(`/dashboard/${patient.patient_id}`)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 font-medium text-slate-300">{patient.room}</td>
                      <td className="p-4 text-slate-400">{patient.patient_id}</td>
                      <td className="p-4">
                        {patient.status === 'Normal' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-900/20 text-emerald-400 border border-emerald-800/30">
                            Stable / Resting
                          </span>
                        )}
                        {patient.status === 'Warning' && (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-800/30 w-max mb-1">
                              Review Required
                            </span>
                            <span className="text-xs text-slate-500">{patient.alert_message}</span>
                          </div>
                        )}
                        {patient.status === 'Critical' && (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-400 border border-red-800/30 w-max mb-1 animate-pulse">
                              Critical Alert
                            </span>
                            <span className="text-xs text-red-400/80">{patient.alert_message}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                          <span className="text-sm font-medium mr-1">View</span>
                          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!isLoading && filteredPatients.length === 0 && (
              <div className="p-12 text-center text-slate-500">
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