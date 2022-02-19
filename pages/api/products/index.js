import dbConnect from "../../../db/database";
import Admin from "../../../models/admin";
import Product from "../../../models/product";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getProduct(req, res);
};

const getProduct = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { businessId, userId } = session.user;
    const user = await Admin.findById(userId);

    if (!user) {
      res.status(200).json({
        userStatus: false,
        productData: null,
      });
    }

    const product = await Product.find({ businessId });

    res.status(200).json({
      productData: product,
      userStatus: true,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};
