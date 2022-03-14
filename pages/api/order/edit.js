import dbConnect from "../../../db/database";
import Product from "../../../models/product";
import Order from "../../../models/order";
import User from "../../../models/user";
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

    const role = session.user.role;
    const { totalPrice, totalQty, itemList, order, products } = req.body;

    await Order.updateOne(
      { _id: order._id },
      {
        totalPrice,
        totalQty,
        itemList,
      }
    );

    const updateProducts = products.map(async (product) => {
      await Product.updateOne(
        { _id: product._id },
        {
          stockQty: product.stockQty,
        }
      );
    });

    const newOrder = await axios
      .all(updateProducts)
      .then(async (updateProducts) => {
        const orderData = await Order.findById(order._id);
        return orderData;
      });

    if (role === "Owner" && order.doneStatus && order.finishDate !== "-") {
      for (const item of itemList) {
        const originalObj = order.itemList.filter(
          (oriItem) => oriItem.productId === item.productId
        );
        const originalQty = originalObj[0].quantity;

        const product = products.filter(
          (product) => product._id === item.productId
        )[0];

        const gap = item.quantity - originalQty;

        await Product.updateOne(
          { _id: item.productId },
          {
            soldQty: product.soldQty + gap,
          }
        );
      }
    }

    if (role === "Owner" && order.doneStatus && order.finishDate !== "-") {
      const userObj = await User.findOne({
        _id: order.customerId,
      });

      let lastTotalItem = userObj.totalItem;
      let lastTotalPaid = userObj.totalPaid;

      const qtyGap = totalQty - order.totalQty;
      const priceGap = totalPrice - order.totalPrice;

      await User.updateOne(
        { _id: order.customerId },
        {
          totalItem: lastTotalItem + qtyGap,
          totalPaid: lastTotalPaid + priceGap,
        }
      );
    }

    await res.status(200).json({
      msg: newOrder,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
