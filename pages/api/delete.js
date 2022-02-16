import dbConnect from "../../db/database";
import Business from "../../models/business";
import Product from "../../models/product";
import Order from "../../models/order";
import User from "../../models/user";
import { getSession } from "next-auth/react";
import bcrypt from "bcrypt";

dbConnect();

export default async (req, res) => {
  await deleteAcc(req, res);
};

const deleteAcc = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { inputPass, businessId } = req.body;

    const business = await Business.findById(businessId);
    const isMatch = await bcrypt.compare(inputPass, business.password);
    if (!isMatch) {
      return res.status(403).json({
        msg: "Password is incorrect.",
      });
    }

    await Product.findByIdAndDelete(business.productId);
    await Order.findByIdAndDelete(business.orderId);

    business.team.forEach(async (member) => {
      await User.findByIdAndDelete(member.userId);
    });

    await Business.findByIdAndDelete(businessId);

    res.status(200).json({ msg: "Everything is deleted" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
