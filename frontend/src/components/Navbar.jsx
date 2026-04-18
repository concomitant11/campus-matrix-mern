import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ user, setUser }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const isLoggedIn = !!user;

  const NavLink = ({ to, children, className = "" }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`relative font-medium text-sm transition-colors ${
          isActive ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"
        } ${className}`}
      >
        {children}
        {isActive && (
          <motion.div
            layoutId="navbar-indicator"
            className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-indigo-600 rounded-full hidden md:block"
          />
        )}
      </Link>
    );
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50"
          : "bg-white border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:bg-indigo-700 transition-colors shadow-sm">
              <img src="favicon.png" alt="logo" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">Campus Matrix</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn && user?.roles?.includes("mentee") && <NavLink to="/matching">Find Mentor</NavLink>}
            {isLoggedIn && user?.roles?.includes("mentor") && <NavLink to="/matching">Find Mentee</NavLink>}
            
            <NavLink to="/goals">Goals</NavLink>
            <NavLink to="/leaderboard">Leaderboard</NavLink>
            <NavLink to="/resources">Resources</NavLink>
            <NavLink to="/events">Events</NavLink>
            <NavLink to="/news">News</NavLink>
            
            {isLoggedIn && user?.roles?.includes("admin") && (
               <NavLink to="/admin" className="!text-red-600 hover:!text-red-700">Admin</NavLink>
            )}

            {isLoggedIn && (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <Link to="/messages" className="text-slate-400 hover:text-indigo-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                </Link>
                
                <div className="group relative">
                  <Link to="/profile" className="flex items-center gap-2 focus:outline-none">
                    <img
                      src={user?.image || "/avatar.png"}
                      alt={user?.name || "User"}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200 group-hover:ring-indigo-300 transition-all"
                    />
                    <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600" />
                  </Link>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right translate-y-2 group-hover:translate-y-0">
                     <div className="p-3 border-b border-slate-50">
                        <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                     </div>
                     <div className="p-2">
                        <Link to="/profile" className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">View Profile</Link>
                        <Link to="/dashboard" className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Dashboard</Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 mt-1"
                        >
                          <LogOut size={16}/> Logout
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {!isLoggedIn && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <Link to="/auth/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Log in</Link>
                <Link to="/auth/signup" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 flex items-center justify-center rounded-lg hover:bg-indigo-700 transition shadow-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl z-50 flex flex-col md:hidden"
            >
              <div className="p-6 flex-1 overflow-y-auto">
                 <div className="flex justify-between items-center mb-8">
                   <span className="text-xl font-bold text-slate-800">Menu</span>
                   <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                     <X size={20} />
                   </button>
                 </div>
                 
                 <div className="flex flex-col gap-4">
                    {isLoggedIn && user?.roles?.includes("mentee") && <NavLink to="/matching" className="text-lg">Find Mentor</NavLink>}
                    {isLoggedIn && user?.roles?.includes("mentor") && <NavLink to="/matching" className="text-lg">Find Mentee</NavLink>}
                    <NavLink to="/dashboard" className="text-lg">Dashboard</NavLink>
                    <NavLink to="/goals" className="text-lg">Goals</NavLink>
                    <NavLink to="/leaderboard" className="text-lg">Leaderboard</NavLink>
                    <NavLink to="/resources" className="text-lg">Resources</NavLink>
                    <NavLink to="/events" className="text-lg">Events</NavLink>
                    <NavLink to="/news" className="text-lg">News</NavLink>
                    {isLoggedIn && user?.roles?.includes("admin") && (
                       <NavLink to="/admin" className="text-lg !text-red-600">Admin Panel</NavLink>
                    )}
                 </div>
              </div>

              {isLoggedIn ? (
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-3 mb-6">
                    <img src={user?.image || "/avatar.png"} alt="User" className="w-12 h-12 rounded-full border border-slate-200" />
                    <div>
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full bg-white border border-slate-200 text-red-600 font-medium py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-red-50">
                     <LogOut size={18}/> Logout
                  </button>
                </div>
              ) : (
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
                   <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-white border border-slate-200 text-slate-700 font-medium py-3 rounded-xl flex justify-center hover:bg-slate-50">Log in</Link>
                   <Link to="/auth/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl flex justify-center hover:bg-indigo-700">Sign up</Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}