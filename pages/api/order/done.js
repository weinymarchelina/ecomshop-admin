import dbConnect from "../../../db/database";
import Order from "../../../models/order";
import { getSession } from "next-auth/react";
import Product from "../../../models/product";

dbConnect();

export default async (req, res) => {
  await finishOrder(req, res);
};

const finishOrder = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { order, done } = req.body;

    // const theOrder = await Order.findById(orderId);

    let finishDate;
    if (done) {
      finishDate = new Date();
    } else {
      finishDate = "-";
    }

    const result = await Order.updateOne(
      { _id: order._id },
      {
        doneStatus: true,
        finishDate,
      }
    );
    console.log(result);

    for (const item of order.itemList) {
      const product = await Product.findOne({
        _id: item.productId,
      });

      if (finishDate !== "-") {
        console.log("Finish order");
        console.log(
          `${product.name}: from ${product.soldQty} to ${
            product.soldQty + item.quantity
          }`
        );
        await Product.updateOne(
          { _id: item.productId },
          {
            soldQty: product.soldQty + item.quantity,
          }
        );
      } else {
        console.log("Order has been canceled");
        console.log(
          `${product.name}: from ${product.stockQty} to ${
            product.stockQty + item.quantity
          }`
        );
        await Product.updateOne(
          { _id: item.productId },
          {
            stockQty: product.stockQty + item.quantity,
          }
        );
      }
    }

    res.status(200).json({
      msg: `Order information has been successfully changed`,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
