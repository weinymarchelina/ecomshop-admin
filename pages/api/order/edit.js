import dbConnect from "../../../db/database";
import Product from "../../../models/product";
import Order from "../../../models/order";
import { getSession } from "next-auth/react";

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

    for (const product of products) {
      const theOrderedQty = orderOriItem.find(
        (item) => item.productId === product._id
      );

      console.log(`
      Original Stock: ${product.stockQty + theOrderedQty.quantity}
      Purchased: ${product.orderedQty}
      Current Stock: ${
        product.stockQty + theOrderedQty.quantity - product.orderedQty
      }
      `);

      await Product.updateOne(
        { _id: product.productId },
        {
          stockQty:
            product.stockQty + theOrderedQty.quantity - product.orderedQty,
        }
      );
    }

    const orderData = await Order.findById(orderId);
    res.status(200).json({
      msg: orderData,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
