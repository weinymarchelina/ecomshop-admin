import dbConnect from "../../../db/database";
import Order from "../../../models/order";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getProduct(req, res);
};

const getProduct = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { businessId } = session.user;

    const { productId } = req.body;

    let isUsed = false;
    const orders = await Order.find({ businessId });
    for (const order of orders) {
      const checkSame = order.itemList.filter((item) => {
        return item.productId === productId;
      });

      if (checkSame[0]) isUsed = true;
    }

    res.status(200).json({
      isUsed,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
