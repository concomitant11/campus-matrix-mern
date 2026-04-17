import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Target, MessageSquare, UserCircle, Activity } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user?.hasProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-slate-200 text-center"
        >
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome, {user?.name}!</h2>
          <p className="text-slate-500 mb-8">Your journey begins with setting up your profile. Tell us about your goals and interests to find the perfect matches.</p>
          <button
            onClick={() => navigate("/create-profile")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm"
          >
            Complete Profile Setup
          </button>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 relative overflow-hidden">

      {/* Simplified background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-50/40 to-blue-50/40 rounded-full blur-3xl opacity-50 -z-10 -translate-y-1/2 translate-x-1/4" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, <span className="font-medium text-indigo-600">{user.name}</span>. Ready to make progress today?</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => navigate("/matching")} className="bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
               <Users size={16}/> Connect
             </button>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer hover:shadow-md" onClick={() => navigate("/matching")}>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Network Hub</h2>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Find the perfect mentor or mentees based on your mutual skills and core interests.
            </p>
            <div className="text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              {user.roles?.includes("mentor") && user.roles?.includes("mentee") ? "Explore Matches" : user.roles?.includes("mentor") ? "Find Mentees" : "Find Mentors"} &rarr;
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer hover:shadow-md" onClick={() => navigate("/goals")}>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Active Goals</h2>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Track tasks assigned to you by mentors. Deliver on time to win gamification badges.
            </p>
            <div className="text-emerald-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Manage Goals &rarr;
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-purple-300 transition-all cursor-pointer hover:shadow-md" onClick={() => navigate("/messages")}>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Communications</h2>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Securely message your assigned peers. Supervised chats ensure safety and focus.
            </p>
            <div className="text-purple-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Open Inbox &rarr;
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={itemVariants} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-300 transition-all cursor-pointer hover:shadow-md" onClick={() => navigate("/profile")}>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Your Profile</h2>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
               View your generated Gamification points, manage skillsets, and adjust departments.
            </p>
            <div className="text-amber-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Edit Settings &rarr;
            </div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
