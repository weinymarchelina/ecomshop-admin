import dbConnect from "../../../db/database";
import Product from "../../../models/product";
import Admin from "../../../models/admin";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getProduct(req, res);
};

const getProduct = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { userId } = session.user;

    const user = await Admin.findById(userId);

    if (!user) {
      return res.status(200).json({
        userStatus: false,
        product: null,
      });
    }

    const { productId } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(200).json({
        product: null,
        userStatus: true,
      });
    }

    res.status(200).json({
      product,
      userStatus: true,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};
