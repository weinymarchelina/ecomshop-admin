import dbConnect from "../../../db/database";
import Product from "../../../models/product";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await deleteProduct(req, res);
};

const deleteProduct = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { selectedProduct } = req.body;

    await Product.findByIdAndDelete(selectedProduct._id);

    res
      .status(200)
      .json({ msg: `${selectedProduct.name} has been successfully deleted` });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
