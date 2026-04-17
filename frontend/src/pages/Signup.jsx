import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    year: "",
    role: "", // mentor or mentee
  });

  const [roleDisabled, setRoleDisabled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is already logged in
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");

    // Auto-select role based on year
    if (name === "year") {
      let updatedRole = "";
      let disableRole = false;

      if (value === "1") {
        updatedRole = "mentee";
        disableRole = true;
      } else if (value === "4") {
        updatedRole = "mentor";
        disableRole = true;
      }

      setFormData((prev) => ({
        ...prev,
        year: value,
        role: updatedRole,
      }));
      setRoleDisabled(disableRole);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/auth/signup", formData, {
        withCredentials: true,
      });
      navigate("/auth/login");
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />

          <select
            name="year"
            required
            value={formData.year}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded bg-white"
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <select
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            disabled={roleDisabled}
            className="w-full px-4 py-2 border rounded bg-white"
          >
            <option value="">Select Role</option>
            <option value="mentee">Mentee</option>
            <option value="mentor">Mentor</option>
          </select>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-200"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/auth/login" className="text-indigo-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
