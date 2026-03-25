// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router'; 
import { Activity, Menu, X, LogOut, LayoutDashboard, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Tells us which page we are currently on
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check the current dynamic state of the user
  const userRole = localStorage.getItem('userRole');
  const patientId = localStorage.getItem('patientId');

  // Handle the scroll blur effect
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
      // If we aren't on the home page, go to home page first
      navigate('/');
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${
        isScrolled || location.pathname !== '/'
          ? 'bg-slate-950/90 border-slate-800 backdrop-blur-md py-4' 
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* Universal Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <Activity className="text-blue-500 w-8 h-8" />
          <span className="text-xl font-bold text-white tracking-wide">NeuroSleep IoT</span>
        </div>

        {/* --- DYNAMIC DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex items-center space-x-6">
          
          {/* Show landing page links ONLY if nobody is logged in */}
          {!userRole && (
            <>
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, '#how-it-works')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">How it Works</a>
              <a href="#technology" onClick={(e) => scrollToSection(e, '#technology')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Technology</a>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-900/20 ml-4"
              >
                Portal Login
              </button>
            </>
          )}

          {/* Show Patient specific links */}
          {userRole === 'patient' && (
            <>
              <button onClick={() => navigate(`/dashboard/${patientId}`)} className="flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors">
                <LayoutDashboard size={16} className="mr-2" /> My Telemetry
              </button>
              <button onClick={handleLogout} className="flex items-center bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-red-800/50">
                <LogOut size={16} className="mr-2" /> Logout
              </button>
            </>
          )}

          {/* Show Admin specific links */}
          {userRole === 'admin' && (
            <>
              <button onClick={() => navigate('/admin-portal')} className="flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors">
                <ShieldAlert size={16} className="mr-2 text-blue-400" /> Command Center
              </button>
              <button onClick={handleLogout} className="flex items-center bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-red-800/50">
                <LogOut size={16} className="mr-2" /> Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden text-slate-400 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* --- DYNAMIC MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 shadow-2xl flex flex-col py-4 px-6 space-y-4">
          {!userRole && (
            <>
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, '#how-it-works')} className="text-lg font-medium text-slate-300 hover:text-white border-b border-slate-800 pb-2">How it Works</a>
              <a href="#technology" onClick={(e) => scrollToSection(e, '#technology')} className="text-lg font-medium text-slate-300 hover:text-white border-b border-slate-800 pb-2">Technology</a>
              <button onClick={() => { setIsMobileMenuOpen(false); navigate('/auth'); }} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg font-medium transition-all mt-4">
                Portal Login
              </button>
            </>
          )}
          {userRole && (
            <button onClick={handleLogout} className="bg-red-900/50 border border-red-800 hover:bg-red-800 text-red-200 w-full py-3 rounded-lg font-medium transition-all mt-4 flex justify-center items-center">
              <LogOut size={18} className="mr-2" /> Secure Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;