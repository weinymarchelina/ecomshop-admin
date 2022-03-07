import dbConnect from "../../../db/database";
import Product from "../../../models/product";
import Order from "../../../models/order";
import { getSession } from "next-auth/react";
import axios from "axios";

dbConnect();

export default async (req, res) => {
  await addOrder(req, res);
};

const addOrder = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { totalPrice, totalQty, itemList, orderId, orderOriItem, products } =
      req.body;

    await Order.updateOne(
      { _id: orderId },
      {
        totalPrice,
        totalQty,
        itemList,
      }
    );

    const updateProducts = products.map(async (product) => {
      console.log(product.name + ": " + product.stockQty);
      const result = await Product.updateOne(
        { _id: product._id },
        {
          stockQty: product.stockQty,
        }
      );
      console.log(result);
    });

    const newOrder = await axios
      .all(updateProducts)
      .then(async (updateProducts) => {
        console.log(updateProducts);

        const orderData = await Order.findById(orderId);
        return orderData;
      });

    await res.status(200).json({
      msg: newOrder,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
