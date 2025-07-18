const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// SIGNUP
exports.signup = async (req, res) => {
  const { mobile, password, pinPersonal, pinGeneral } = req.body;
  console.log("Signup Request Body:", req.body);

  try {
    const existing = await User.findOne({ mobile });
    console.log("Existing user check done:", existing);

    if (existing) {
      console.log("Mobile already registered");
      return res.status(400).json({ msg: "Mobile already registered" });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    const user = new User({ mobile, password: hashedPass, pinPersonal, pinGeneral });
    await user.save();
    console.log("User saved to DB");

    res.status(201).json({ msg: "User created" });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { mobile, password } = req.body;
  console.log("Login Request Body:", req.body);

  try {
    const user = await User.findOne({ mobile });
    console.log("User fetched:", user);

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ msg: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log("Password match status:", match);

    if (!match) {
      console.log("Invalid password");
      return res.status(401).json({ msg: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    console.log("JWT token generated");

    res.json({ token, user });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
