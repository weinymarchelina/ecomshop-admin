import dbConnect from "../../../db/database";
import User from "../../../models/user";
import Product from "../../../models/product";
import Order from "../../../models/order";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getUser(req, res);
};

const getUser = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { businessId } = session.user;
    const { start, end } = req.body;
    console.log(start);
    console.log(end);

    const products = await Product.find({ businessId });
    const orders = await Order.find({
      finishDate: {
        $gte: "Fri Feb 25 2022 15:31:58 GMT+0800 (Central Indonesia Time)",
        $lt: "Thu Mar 31 2022 15:31:58 GMT+0800 (Central Indonesia Time)",
      },
    });
    const userList = [];
    let newArr = [];

    const favItems = products.map((product) => {
      let buyedQty = 0;
      let amount = 0;

      for (const order of orders) {
        for (const item of order.itemList) {
          if (item.productId === product.id) {
            buyedQty = buyedQty += item.quantity;
            amount = amount += item.quantity * item.price;
          }
        }

        // console.log(order.customerId);
        // const result = userList.map((id) => {
        //   if (order.customerId !== id) {
        //     return id;
        //   }
        // });
        // console.log(result);
        // if (result) {
        //   userList.push(order.customerId);
        // }

        // for (const userId of userList) {
        //   console.log(order.customerId);
        //   console.log(order.customerId !== userId);
        //   if (order.customerId !== userId) {
        //     userList.push(order.customerId);
        //   }
        // }
      }

      console.log(`${product.name}: ${buyedQty}`);
      console.log(`${product.name}: ${amount}`);

      return {
        productId: product._id,
        name: product.name,
        image: product.image,
        buyedQty,
        amount,
      };
    });

    favItems.sort((a, b) => b.buyedQty - a.buyedQty);
    // console.log(favItems);
    const topItems = favItems.filter((product) => product.buyedQty > 0);

    // console.log(topItems);

    console.log(userList);
    // const user = await User.find({
    //     // search absed on id from orders like loop
    // });

    res.status(200).json({
      //   user,
      report: topItems,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json(err.message);
  }
};
