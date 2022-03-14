import dbConnect from "../../../db/database";
import User from "../../../models/user";
import Product from "../../../models/product";
import Order from "../../../models/order";
import { getSession } from "next-auth/react";
import axios from "axios";

dbConnect();

export default async (req, res) => {
  await getUser(req, res);
};

const getUser = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { businessId } = session.user;
    const { start, end, filter } = req.body;

    const products = await Product.find({ businessId });

    let orders = [];
    if (filter !== "All") {
      orders = await Order.find({
        businessId,
        finishDate: {
          $gte: start,
          $lt: end,
        },
      });
    } else {
      orders = await Order.find({ businessId });
    }

    const userList = [];

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

        if (!userList.includes(order.customerId)) {
          userList.push(order.customerId);
        }
      }

      return {
        productId: product._id,
        name: product.name,
        image: product.image,
        buyedQty,
        amount,
      };
    });

    favItems.sort((a, b) => b.buyedQty - a.buyedQty);

    const topItems = favItems.filter((product) => product.buyedQty > 0);

    const userInfo = userList.map(async (id) => {
      const userOrders = orders.filter((order) => order.customerId === id);
      const user = await User.find({
        _id: id,
      });

      const paid = userOrders
        .map((userOrder) => userOrder.totalPrice)
        .reduce((partialSum, a) => partialSum + a, 0);
      const qty = userOrders
        .map((userOrder) => userOrder.totalQty)
        .reduce((partialSum, a) => partialSum + a, 0);

      return {
        name: user[0].name,
        picture: user[0].picture,
        accName: user[0].contactInfo?.name,
        userId: id,
        totalOrder: userOrders.length,
        totalPaid: paid,
        totalQty: qty,
      };
    });

    axios.all(userInfo).then(async (userArr) => {
      userArr.sort((a, b) => b.totalPaid - a.totalPaid);

      return res.status(200).json({
        userList: userArr,
        report: topItems,
      });
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json(err.message);
  }
};
