const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    desc: String,
    image: String,
    stockQty: String,
    warningQty: String,
    activeStatus: Boolean,
    price: Array,
    businessId: String,
  },
  { timestamps: true }
);

let Product =
  mongoose.models.products || mongoose.model("products", ProductSchema);

module.exports = Product;
