require("dotenv").config();
const connectDB = require("./src/config/db");

connectDB().catch((e) => {
  console.error("❌ Mongo connect failed", e);
  process.exit(1);
});
