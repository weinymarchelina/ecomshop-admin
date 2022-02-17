import dbConnect from "../../../db/database";
import Business from "../../../models/business";
import { getSession } from "next-auth/react";
import bcrypt from "bcrypt";

dbConnect();

export default async (req, res) => {
  await editInfo(req, res);
};

const editInfo = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { newName, newPhone, newEmail, password, businessId } = req.body;

    const business = await Business.findById(businessId);
    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) {
      return res.status(403).json({
        msg: "Password is incorrect",
      });
    }

    await Business.updateOne(
      { _id: businessId },
      {
        name: newName,
        phone: newPhone,
        email: newEmail,
      }
    );

    res.status(200).json({
      msg: `Business information has been successfully changed`,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
