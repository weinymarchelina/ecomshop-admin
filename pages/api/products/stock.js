import dbConnect from "../../../db/database";
import Product from "../../../models/product";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await editStock(req, res);
};

const editStock = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const products = req.body;

    products.map(async (product) => {
      await Product.updateOne(
        { _id: product._id },
        {
          stockQty: product.stockQty,
        }
      );
    });

    await res.status(200).json({
      msg: "Products updated",
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
