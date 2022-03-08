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

    const role = session.user.role;
    const { totalPrice, totalQty, itemList, order, products } = req.body;

    console.log(role);
    await Order.updateOne(
      { _id: order._id },
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

        const orderData = await Order.findById(order._id);
        return orderData;
      });

    if (role === "Owner" && order.doneStatus && order.finishDate !== "-") {
      console.log("after order edit");

      for (const item of itemList) {
        const originalObj = order.itemList.filter(
          (oriItem) => oriItem.productId === item.productId
        );
        const originalQty = originalObj[0].quantity;

        const product = products.filter(
          (product) => product._id === item.productId
        )[0];
        console.log(product);

        const gap = item.quantity - originalQty;
        console.log(gap);

        console.log("Finish order");
        await Product.updateOne(
          { _id: item.productId },
          {
            soldQty: product.soldQty + gap,
          }
        );
      }
    } else {
      console.log("before order edit");
    }

    await res.status(200).json({
      msg: newOrder,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
