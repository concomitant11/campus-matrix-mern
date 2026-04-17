import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, roles, year, adminSecret } = req.body;

    // Validate required fields
    if (!name || !email || !password || !roles || !roles.length || !year) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!adminSecret && !email.endsWith("@satiengg.in")) {
      return res.status(403).json({ message: "Only @satiengg.in college emails are permitted." });
    }

    // Validate role based on year
    const yearNum = parseInt(year);
    if (yearNum === 1 && (roles.includes('mentor') || !roles.includes('mentee'))) {
      return res.status(400).json({ message: '1st year students can only be mentees' });
    }
    if (yearNum === 4 && (roles.includes('mentee') || !roles.includes('mentor'))) {
      return res.status(400).json({ message: '4th year students can only be mentors' });
    }

    let finalRoles = [...roles];
    if (adminSecret) {
       if (adminSecret === (process.env.ADMIN_SECRET || "ILOVEHACKATHONS")) {
           if (!finalRoles.includes("admin")) finalRoles.push("admin");
       } else {
           return res.status(403).json({ message: "Invalid Admin Secret Key" });
       }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      roles: finalRoles,
      year,
      hasProfile: false,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// LOGIN CONTROLLER
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'User does not exist.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Set token in cookie
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          hasProfile: user.hasProfile,
        },
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


export const logoutUser = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logged out successfully" });
};


