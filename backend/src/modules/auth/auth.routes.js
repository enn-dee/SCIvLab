import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "../../models/User.js";

dotenv.config();

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { fullName, rollNumber, password, role } = req.body;

    if (!fullName || !password) {
      return res.status(400).json({
        msg: "Missing required fields",
      });
    }

    if (role === "student" && !rollNumber) {
      return res.status(400).json({
        msg: "Roll number is required",
      });
    }

    let existingUser = null;

    if (role === "student") {
      existingUser = await User.findOne({
        rollNumber: rollNumber.toUpperCase(),
      });
    } else {
      existingUser = await User.findOne({
        fullName,
      });
    }

    if (existingUser) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,

      rollNumber: role === "student" ? rollNumber.toUpperCase() : undefined,

      password: hashed,

      role,
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    // const {
    //   rollNumber,
    //   fullName,
    //   password
    // } = req.body;

    // let user = null;

    // if (rollNumber) {

    //   user = await User.findOne({
    //     rollNumber: rollNumber.toUpperCase()
    //   });

    // } else if (fullName) {

    //   user = await User.findOne({
    //     fullName
    //   });

    // }
    const { rollNumber, fullName, password } = req.body;
    let user = null;

    if (rollNumber) {
      user = await User.findOne({
        $or: [
          { rollNumber: rollNumber.toUpperCase() },
          { registrationNumber: rollNumber.toUpperCase() },
        ],
      });
    } else if (fullName) {
      user = await User.findOne({ fullName });
    }
    if (!user) {
      return res.status(400).json({
        msg: "User not found",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        msg: "Wrong password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "7d",
      },
    );
    ``;

    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
});

router.get("/all-students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "fullName rollNumber",
    );
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
