import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle, Circle, Trash2, Calendar, Target, Award, Info } from "lucide-react";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/goals", {
        credentials: "include",
      });
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      toast.error("Failed to load goals.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description, deadline }),
      });

      if (res.ok) {
        toast.success("Goal successfully created");
        setTitle("");
        setDescription("");
        setDeadline("");
        fetchGoals();
      } else {
        toast.error("Failed to add goal.");
      }
    } catch (err) {
      toast.error("Server error.");
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setGoals((prev) => prev.filter(g => g._id !== id));
        toast.success("Goal removed");
      }
    } catch (err) {
      toast.error("Error deleting goal.");
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed: !completed }),
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Optimistic UI Update
        setGoals((prev) => prev.map(g => g._id === id ? { ...g, completed: !completed } : g));

        // Gamification Toasts
        if (!completed) { // If it was just completed
           if (data.pointsEarned > 0) {
              toast.success(`Goal Completed! +${data.pointsEarned} Points`, { icon: <Award className="text-yellow-500"/> });
           }
           if (data.earnedBadges && data.earnedBadges.length > 0) {
              data.earnedBadges.forEach(badge => {
                 toast.success(`New Badge Earned: ${badge}!`);
              });
           }
        }
      }
    } catch (err) {
      toast.error("Failed to update goal status.");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const completedGoals = goals.filter((g) => g.completed);
  const pendingGoals = goals.filter((g) => !g.completed);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
               <Target className="text-indigo-600" /> Active Goals
             </h1>
             <p className="text-sm text-slate-500 mt-1">Manage your tasks and earn gamification rewards.</p>
           </div>
        </div>

        <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
           {/* Add Goal Sidebar */}
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
             <h2 className="text-sm font-semibold text-slate-800 mb-4 tracking-wide uppercase">New Goal</h2>
             <form onSubmit={handleAddGoal} className="space-y-4">
               <div>
                 <input
                   className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                   placeholder="Task Title..."
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   required
                 />
               </div>
               <div>
                 <textarea
                   className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none min-h-[80px]"
                   placeholder="Description..."
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   required
                 />
               </div>
               <div>
                 <div className="relative">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input
                     type="date"
                     className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 transition-all"
                     value={deadline}
                     onChange={(e) => setDeadline(e.target.value)}
                     required
                   />
                 </div>
               </div>
               <button
                 type="submit"
                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
               >
                 <Plus size={16} /> Create Goal
               </button>
             </form>

             <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <div className="flex items-start gap-2 text-indigo-800">
                   <Info size={16} className="mt-0.5 shrink-0" />
                   <p className="text-xs leading-relaxed font-medium">Completing goals on time yields <span className="font-bold underline">+50 Points</span>. Late turn-ins give <span className="font-bold underline">+20 Points</span>.</p>
                </div>
             </div>
           </div>

           {/* Goals List Area */}
           <div className="space-y-6">
             {loading ? (
                <div className="flex justify-center py-10">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
             ) : (
                <>
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-200 pb-2">In Progress ({pendingGoals.length})</h3>
                    <AnimatePresence>
                      {pendingGoals.length === 0 && (
                         <div className="text-sm text-slate-500 italic py-4">No pending goals.</div>
                      )}
                      {pendingGoals.map((goal) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={goal._id}
                          className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4 group hover:border-indigo-300 transition-colors"
                        >
                          <button 
                            onClick={() => toggleComplete(goal._id, goal.completed)}
                            className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-colors shrink-0"
                          >
                             <Circle size={24} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-slate-800 font-medium truncate">{goal.title}</h3>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{goal.description}</p>
                            
                            <div className="flex items-center gap-4 mt-3">
                               {goal.deadline && (
                                 <span className={`text-xs font-medium flex items-center gap-1 ${new Date(goal.deadline) < new Date() ? 'text-red-500' : 'text-slate-400'}`}>
                                   <Calendar size={12} /> {new Date(goal.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                 </span>
                               )}
                               {goal.assigner && (
                                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                     Mentor Assigned
                                  </span>
                               )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteGoal(goal._id)}
                            className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2 shrink-0 self-start"
                            title="Delete Goal"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {completedGoals.length > 0 && (
                     <div className="space-y-3 pt-6 mt-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-200 pb-2">Completed ({completedGoals.length})</h3>
                        <AnimatePresence>
                          {completedGoals.map((goal) => (
                            <motion.div
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              key={goal._id}
                              className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-4 group opacity-75"
                            >
                              <button 
                                onClick={() => toggleComplete(goal._id, goal.completed)}
                                className="mt-0.5 text-emerald-500 hover:text-slate-400 transition-colors shrink-0"
                              >
                                 <CheckCircle size={24} />
                              </button>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-slate-600 font-medium line-through decoration-slate-300">{goal.title}</h3>
                                <p className="text-sm text-slate-400 mt-1 line-clamp-1">{goal.description}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteGoal(goal._id)}
                                className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2 shrink-0 self-start"
                              >
                                <Trash2 size={18} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                     </div>
                  )}
                </>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Goals;
