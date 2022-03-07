import dbConnect from "../../../db/database";
import Order from "../../../models/order";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await finishOrder(req, res);
};

const finishOrder = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { orderId, done } = req.body;

    // const theOrder = await Order.findById(orderId);

    let finishDate;
    if (done) {
      finishDate = new Date();
    } else {
      finishDate = "-";
    }

    const result = await Order.updateOne(
      { _id: orderId },
      {
        doneStatus: true,
        finishDate,
      }
    );
    console.log(result);

    res.status(200).json({
      msg: `Order information has been successfully changed`,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
