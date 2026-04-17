import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Avatar from "../components/ui/avatar";
import Button from "../components/ui/button";

export default function Navbar({ user, setUser }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            <img src="/logo2.png" alt="Campus Matrix" className="h-10 w-32" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {isLoggedIn && user?.roles?.includes("mentee") && (
              <Link to="/matching" className="text-gray-700 hover:text-blue-600">
                Find Mentor
              </Link>
            )}
            {isLoggedIn && user?.roles?.includes("mentor") && (
              <Link to="/matching" className="text-gray-700 hover:text-blue-600">
                Find Mentee
              </Link>
            )}
            <Link to="/goals" className="text-gray-700 hover:text-blue-600">
              Goals
            </Link>
            <Link to="/leaderboard" className="text-gray-700 hover:text-blue-600">
              Leaderboard
            </Link>
            <Link to="/resources" className="text-gray-700 hover:text-blue-600">
              Resources
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-blue-600">
              Events
            </Link>
            {isLoggedIn && user?.roles?.includes("admin") && (
               <Link to="/admin" className="text-red-700 font-bold hover:text-red-600">
                  Admin Panel
               </Link>
            )}

            {isLoggedIn && (
              <>
                <Link to="/messages" className="text-gray-700 hover:text-blue-600">
                  Messages
                </Link>
                <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
                  <img
                    src={user?.image || "/avatar.png"}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white border border-red-600 px-3 bg-red-500 py-1 rounded hover:bg-red-600 cursor-pointer"
                >
                  Logout
                </button>
              </>
            )}

            {!isLoggedIn && (
              <div className="flex space-x-4">
                <Button variant="outline">
                  <Link to="/auth/login">Login</Link>
                </Button>
                <Button>
                  <Link to="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-blue-600"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-40 transform ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Link
              to="/"
              className="text-xl font-bold text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Campus Matrix
            </Link>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6 text-gray-700 hover:text-blue-600" />
            </button>
          </div>

          <div className="flex flex-col space-y-4">
            {isLoggedIn && user?.roles?.includes("mentee") && (
              <Link to="/matching" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-700 hover:text-blue-600">
                Find Mentor
              </Link>
            )}
            {isLoggedIn && user?.roles?.includes("mentor") && (
              <Link to="/matching" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-700 hover:text-blue-600">
                Find Mentee
              </Link>
            )}
            <Link to="/goals" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-700 hover:text-blue-600">
              Goals
            </Link>
            <Link to="/leaderboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-700 hover:text-blue-600">
              Leaderboard
            </Link>
            <Link to="/resources" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-700 hover:text-blue-600">
              Resources
            </Link>
            <Link to="/events" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-700 hover:text-blue-600">
              Events
            </Link>
            {isLoggedIn && user?.roles?.includes("admin") && (
               <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-red-700 font-bold hover:text-red-600">
                  Admin Panel
               </Link>
            )}
            {isLoggedIn && (
              <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-700 hover:text-blue-600">
                Messages
              </Link>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-200">
            {isLoggedIn ? (
              <div className="space-y-4">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-lg"
                >
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-left text-lg text-red-600 w-full"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button className="w-full">
                  <Link to="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}