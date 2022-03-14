import dbConnect from "../../../db/database";
import Order from "../../../models/order";
import Product from "../../../models/product";
import User from "../../../models/user";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getOrder(req, res);
};

const getOrder = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });
    const { businessId } = session.user;

    const orderData = await Order.find({ businessId }).sort({ _id: -1 });

    const productData = await Product.find({
      businessId,
    });

    const userData = await User.find({ businessId });

    res.status(200).json({
      orderData,
      productData,
      userData,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
