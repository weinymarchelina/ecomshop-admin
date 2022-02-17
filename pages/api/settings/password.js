import dbConnect from "../../../db/database";
import Business from "../../../models/business";
import { getSession } from "next-auth/react";
import bcrypt from "bcrypt";

dbConnect();

export default async (req, res) => {
  await checkPassword(req, res);
};

const checkPassword = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { oldPassword, newPassword, businessId } = req.body;

    const business = await Business.findById(businessId);
    const isMatch = await bcrypt.compare(oldPassword, business.password);
    if (!isMatch) {
      return res.status(403).json({
        msg: "Old password is incorrect",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(403).json({
        msg: "New password and old password cannot be same",
      });
    }

    const salt = await bcrypt.genSalt();
    const hashNewPass = await bcrypt.hash(newPassword, salt);

    await Business.updateOne(
      { _id: businessId },
      {
        password: hashNewPass,
      }
    );

    res.status(200).json({
      msg: `Password has been successfully changed`,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
