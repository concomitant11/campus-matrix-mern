import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Static UI components
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateProfile from "./pages/CreateProfile";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Matching from "./pages/Matching";
import Goals from "./pages/Goals";
import Messages from "./pages/Messages";
import Resources from "./pages/Resources"
import Events from "./pages/Events"
import Leaderboard from "./pages/Leaderboard"
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  const [user, setUser] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setCheckedAuth(true);
      }
    };
    fetchUser();
  }, []);

  if (!checkedAuth) return null; // Avoid flicker while checking auth

  return (
    <>
      <Router>
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <>
                  <Landing />
                  <Features />
                  <Testimonials />
                  <Footer />
                </>
              )
            }
          />

          <Route path="/auth/login" element={<Login setUser={setUser} />} />
          <Route path="/auth/signup" element={<Signup setUser={setUser} />} />
          <Route path="/me" element={<Home />} />

          <Route path="/resources" element={<ProtectedRoute user={user}>
                <Resources />
              </ProtectedRoute>}/>
          <Route path="/events" element={<ProtectedRoute user={user}>
                <Events />
              </ProtectedRoute>}/>
          <Route path="/leaderboard" element={<ProtectedRoute user={user}>
                <Leaderboard />
              </ProtectedRoute>}/>
          <Route path="/admin" element={
              <ProtectedRoute user={user}>
                 <AdminDashboard />
              </ProtectedRoute>
          }/>

          <Route
            path="/create-profile"
            element={
              <ProtectedRoute user={user}>
                <CreateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matching"
            element={
              <ProtectedRoute user={user}>
                <Matching />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute user={user}>
                <Goals />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute user={user}>
                <Messages />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;