import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';

const Matching = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", { withCredentials: true });
        if (res.status === 200) {
          setUser(res.data);
          let defaultTab = res.data.roles.includes("mentee") ? "mentor" : "mentee";
          setActiveTab(defaultTab);
          fetchMatches(defaultTab);
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error(err);
        navigate("/");
      }
    };
    getUser();
  }, [navigate]);

  const fetchMatches = async (targetRole) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/matches/potential?targetRole=${targetRole}`, {
        withCredentials: true,
      });
      setMatches(res.data);
    } catch (err) {
      if (err.response?.status === 400) {
         toast.error("Please create a profile first to see matches!");
      } else {
         toast.error("Failed to load matches");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (targetRole) => {
    setActiveTab(targetRole);
    fetchMatches(targetRole);
  };

  const requestConnection = async (targetUserId) => {
    try {
      await axios.post("/api/matches/request", {
        targetUserId,
        targetRole: activeTab
      }, { withCredentials: true });
      toast.success("Request sent successfully!");
      setMatches(prev => prev.filter(m => m.profile.user._id !== targetUserId));
    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-center">
        True Match System
      </h1>

      <div className="mb-6 flex justify-center space-x-4">
        {user?.roles?.includes("mentee") && (
           <button 
              className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${activeTab === 'mentor' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => handleTabSwitch('mentor')}
           >
              Find a Mentor
           </button>
        )}
        {user?.roles?.includes("mentor") && (
           <button 
              className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${activeTab === 'mentee' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => handleTabSwitch('mentee')}
           >
              Find a Mentee
           </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-solid mb-4"></div>
          <p className="text-xl font-medium text-gray-600">Calculating Compatibility...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No matches found right now. Check back later or complete more fields in your profile!
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {matches.map((matchData) => {
             const m = matchData.profile;
             const targetUser = m.user;
             return (
              <div
                key={m._id}
                className="bg-white p-4 rounded-xl shadow-md border hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <img
                  src={targetUser?.image || "/avatar.png"}
                  alt={targetUser?.name}
                  className="w-20 h-20 mx-auto rounded-full mb-4 object-cover border-2 border-indigo-100"
                />
                <h2 className="text-xl font-semibold text-center text-gray-800">{targetUser?.name}</h2>
                <p className="text-center text-gray-500 text-sm mb-2">{m.department}</p>

                <div className="bg-indigo-50 text-indigo-700 text-xs font-bold text-center py-1 rounded mb-3">
                  Match Score: {matchData.score}
                </div>

                <div className="mb-3 text-center">
                   <p className="text-xs text-gray-400 font-semibold mb-1">SKILLS</p>
                   <div className="flex flex-wrap justify-center gap-1">
                     {m.skills.slice(0, 3).map((s, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{s}</span>
                     ))}
                     {m.skills.length > 3 && <span className="text-gray-400 text-xs px-1">+{m.skills.length - 3}</span>}
                   </div>
                </div>

                <button
                  className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition cursor-pointer"
                  onClick={() => requestConnection(targetUser._id)}
                >
                  Send Request
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default Matching;
