// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router'; 
import { Activity, Menu, X, LogOut, LayoutDashboard, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const userRole = localStorage.getItem('userRole');
  const patientId = localStorage.getItem('patientId');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('patientId');
    setIsMobileMenuOpen(false);
    navigate('/auth');
  };

  const scrollToSection = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className={`fixed w-full top-0 z-50 transition-all duration-300 border-b bg-[#FDF7F0] border-[#1A5A55]/20 shadow-sm ${
        isScrolled ? 'py-4' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* Universal Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <Activity className="text-[#1A5A55] w-8 h-8" />
          <span className="text-xl font-bold text-[#1A5A55] tracking-wide">NeuroSleep IoT</span>
        </div>

        {/* --- DYNAMIC DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex items-center space-x-6">
          
          {!userRole && (
            <>
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, '#how-it-works')} className="text-sm font-medium text-[#1A5A55]/70 hover:text-[#1A5A55] transition-colors">How it Works</a>
              <a href="#technology" onClick={(e) => scrollToSection(e, '#technology')} className="text-sm font-medium text-[#1A5A55]/70 hover:text-[#1A5A55] transition-colors">Technology</a>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-[#1A5A55] hover:bg-[#1A5A55]/90 text-[#FDF7F0] px-6 py-2 rounded-full font-medium transition-all shadow-lg shadow-[#1A5A55]/20 ml-4"
              >
                Portal Login
              </button>
            </>
          )}

          {userRole === 'patient' && (
            <>
              <button onClick={() => navigate(`/dashboard/${patientId}`)} className="flex items-center text-sm font-medium text-[#1A5A55]/80 hover:text-[#1A5A55] transition-colors">
                <LayoutDashboard size={16} className="mr-2" /> My Telemetry
              </button>
              <button onClick={handleLogout} className="flex items-center bg-white hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-100 hover:border-red-200">
                <LogOut size={16} className="mr-2" /> Logout
              </button>
            </>
          )}

          {userRole === 'admin' && (
            <>
              <button onClick={() => navigate('/admin-portal')} className="flex items-center text-sm font-medium text-[#1A5A55]/80 hover:text-[#1A5A55] transition-colors">
                <ShieldAlert size={16} className="mr-2 text-[#1A5A55]" /> Command Center
              </button>
              <button onClick={handleLogout} className="flex items-center bg-white hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-100 hover:border-red-200">
                <LogOut size={16} className="mr-2" /> Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden text-[#1A5A55]/80 hover:text-[#1A5A55] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* --- DYNAMIC MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#FDF7F0] border-b border-[#1A5A55]/20 shadow-xl flex flex-col py-4 px-6 space-y-4">
          
          {/* If NOT logged in */}
          {!userRole && (
            <>
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, '#how-it-works')} className="text-lg font-medium text-[#1A5A55]/80 hover:text-[#1A5A55] border-b border-[#1A5A55]/10 pb-2">How it Works</a>
              <a href="#technology" onClick={(e) => scrollToSection(e, '#technology')} className="text-lg font-medium text-[#1A5A55]/80 hover:text-[#1A5A55] border-b border-[#1A5A55]/10 pb-2">Technology</a>
              <button onClick={() => { setIsMobileMenuOpen(false); navigate('/auth'); }} className="bg-[#1A5A55] hover:bg-[#1A5A55]/90 text-[#FDF7F0] w-full py-3 rounded-lg font-medium transition-all mt-4 shadow-md shadow-[#1A5A55]/20">
                Portal Login
              </button>
            </>
          )}

          {/* If PATIENT is logged in */}
          {userRole === 'patient' && (
            <button 
              onClick={() => { setIsMobileMenuOpen(false); navigate(`/dashboard/${patientId}`); }} 
              className="flex justify-center items-center text-lg font-bold text-[#1A5A55] bg-white border border-[#1A5A55]/10 hover:bg-[#1A5A55]/5 w-full py-3 rounded-lg transition-all shadow-sm"
            >
              <LayoutDashboard size={18} className="mr-2" /> My Telemetry
            </button>
          )}

          {/* If ADMIN is logged in */}
          {userRole === 'admin' && (
            <button 
              onClick={() => { setIsMobileMenuOpen(false); navigate('/admin-portal'); }} 
              className="flex justify-center items-center text-lg font-bold text-[#1A5A55] bg-white border border-[#1A5A55]/10 hover:bg-[#1A5A55]/5 w-full py-3 rounded-lg transition-all shadow-sm"
            >
              <ShieldAlert size={18} className="mr-2 text-[#1A5A55]" /> Command Center
            </button>
          )}

          {/* Logout Button (Shows for both Patient and Admin) */}
          {userRole && (
            <button onClick={handleLogout} className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 w-full py-3 rounded-lg font-bold transition-all mt-2 flex justify-center items-center shadow-sm">
              <LogOut size={18} className="mr-2" /> Secure Logout
            </button>
          )}

        </div>
      )}
    </nav>
  );
};

export default Navbar;