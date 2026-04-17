import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    year: "",
    roles: [],
    adminSecret: "",
  });

  const [showAdmin, setShowAdmin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/me", { withCredentials: true });
        if (res.status === 200) {
          navigate("/dashboard");
        }
      } catch {}
    };
    checkAuth();
  }, [navigate]);

  const handleYearChange = (e) => {
    const value = e.target.value;
    setError("");

    let updatedRoles = [...formData.roles];
    if (value === "1") {
      updatedRoles = ["mentee"];
    } else if (value === "4") {
      updatedRoles = ["mentor"];
    } else {
      updatedRoles = [];
    }

    setFormData((prev) => ({
      ...prev,
      year: value,
      roles: updatedRoles,
    }));
  };

  const handleRoleToggle = (role) => {
    setError("");
    const { year } = formData;
    if (year === "1" || year === "4") return; // locked

    setFormData((prev) => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles: newRoles };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.roles.length === 0) {
      setError("Please select at least one role.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/signup", formData, {
        withCredentials: true,
      });
      navigate("/auth/login");
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white z-10"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Create Account
          </h2>
          <p className="text-gray-500 mt-2 text-sm">Join the Campus Matrix network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
             <input
               type="text"
               name="name"
               placeholder="Full Name"
               required
               value={formData.name}
               onChange={handleChange}
               className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
             />
             <input
               type="email"
               name="email"
               placeholder="College Email"
               required
               value={formData.email}
               onChange={handleChange}
               className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
             />
             <input
               type="password"
               name="password"
               placeholder="Password"
               required
               value={formData.password}
               onChange={handleChange}
               className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
             />
             <select
               name="year"
               required
               value={formData.year}
               onChange={handleYearChange}
               className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-700"
             >
               <option value="">Select current year</option>
               <option value="1">1st Year</option>
               <option value="2">2nd Year</option>
               <option value="3">3rd Year</option>
               <option value="4">4th Year</option>
             </select>
          </div>

          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">Assign Roles:</p>
            <div className="flex gap-6">
              <label className="flex items-center space-x-2 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.roles.includes("mentee")}
                  onChange={() => handleRoleToggle("mentee")}
                  disabled={formData.year === "1" || formData.year === "4"}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-40 transition-colors"
                />
                <span className={`font-medium ${formData.year === "4" ? "text-gray-400" : "text-gray-700 group-hover:text-indigo-600 transition-colors"}`}>Mentee</span>
              </label>

              <label className="flex items-center space-x-2 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.roles.includes("mentor")}
                  onChange={() => handleRoleToggle("mentor")}
                  disabled={formData.year === "1" || formData.year === "4"}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-40 transition-colors"
                />
                <span className={`font-medium ${formData.year === "1" ? "text-gray-400" : "text-gray-700 group-hover:text-indigo-600 transition-colors"}`}>Mentor</span>
              </label>
            </div>
            
            <AnimatePresence>
               {(formData.year === "1" || formData.year === "4") && (
                 <motion.p 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-indigo-500 mt-2 font-medium"
                 >
                   {formData.year === "1" ? "1st years are locked as Mentees." : "4th years are locked as Mentors."}
                 </motion.p>
               )}
            </AnimatePresence>
          </div>

          <div className="py-2">
             <button type="button" onClick={() => setShowAdmin(!showAdmin)} className="text-xs text-gray-500 hover:text-indigo-600 font-medium transition-colors">
                Register as Faculty / Admin?
             </button>
             <AnimatePresence>
                {showAdmin && (
                   <motion.div
                     initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                     className="mt-3"
                   >
                     <input
                        type="password"
                        name="adminSecret"
                        placeholder="Admin Access Code"
                        value={formData.adminSecret}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-red-50/50 border border-red-200 text-red-900 placeholder-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                     />
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          {error && (
             <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg border border-red-100">
                {error}
             </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full relative flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70"
          >
            {loading ? (
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : "Create Account"}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
            Log in instead
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
