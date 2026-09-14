import connectDB from "../config/db.js";
import bcrypt from "bcryptjs";
import SuperAdmin from "../models/SuperAdmin.js";

const SUPER_ADMIN = {
  fullName: "Principal",
  email: process.env.SUPER_ADMIN_EMAIL,
  password: process.env.SUPER_ADMIN_PASSWORD,
};

const seed = async () => {
  await connectDB();

  const existing = await SuperAdmin.findOne({ email: SUPER_ADMIN.email });
  if (existing) {
    console.log(" Super admin already exists:", existing.email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(SUPER_ADMIN.password, 10);
  const admin = await SuperAdmin.create({
    fullName: SUPER_ADMIN.fullName,
    email: SUPER_ADMIN.email,
    password: hashed,
  });

  console.log("✅ Super admin created");
  console.log("   Email:   ", admin.email);
  console.log(
    "   Password:",
    SUPER_ADMIN.password,
    "(change after first login!)",
  );
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
