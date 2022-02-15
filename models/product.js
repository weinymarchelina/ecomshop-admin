const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    desc: String,
    price: Object,
    image: String,
    category: String,
    stockStatus: String,
    activeStatus: Boolean,
    minimumOrder: Number,
    businessId: String,
  },
  { timestamps: true }
);

let Product =
  mongoose.models.products || mongoose.model("products", ProductSchema);

module.exports = Product;
