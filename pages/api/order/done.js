import dbConnect from "../../../db/database";
import Order from "../../../models/order";
import User from "../../../models/user";
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

    let finishDate;
    if (done) {
      finishDate = new Date().toISOString();
    } else {
      finishDate = "-";
    }

    await Order.updateOne(
      { _id: order._id },
      {
        doneStatus: true,
        finishDate,
      }
    );

    for (const item of order.itemList) {
      const product = await Product.findOne({
        _id: item.productId,
      });

      if (finishDate !== "-") {
        await Product.updateOne(
          { _id: item.productId },
          {
            soldQty: product.soldQty + item.quantity,
          }
        );
      } else {
        await Product.updateOne(
          { _id: item.productId },
          {
            stockQty: product.stockQty + item.quantity,
          }
        );
      }
    }

    if (finishDate !== "-") {
      const userObj = await User.findOne({
        _id: order.customerId,
      });

      let lastTotalOrder = userObj.totalOrder;
      let lastTotalItem = userObj.totalItem;
      let lastTotalPaid = userObj.totalPaid;
      await User.updateOne(
        { _id: order.customerId },
        {
          totalOrder: (lastTotalOrder += 1),
          totalItem: lastTotalItem + order.totalQty,
          totalPaid: lastTotalPaid + order.totalPrice,
        }
      );
    }

    res.status(200).json({
      msg: `Order information has been successfully changed`,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
