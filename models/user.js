const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "user",
    },
    email: {
      type: String,
    },
    picture: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      default: "Employee",
    },
    businessId: String,
  },
  { timestamps: true }
);

let User = mongoose.models?.users || mongoose.model("users", UserSchema);

module.exports = User;
