const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "admin",
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

let Admin = mongoose.models?.admins || mongoose.model("admins", AdminSchema);

module.exports = Admin;
