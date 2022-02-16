import dbConnect from "../../../db/database";
import Business from "../../../models/business";
import bcrypt from "bcrypt";

dbConnect();

export default async (req, res) => {
  await loginBusiness(req, res);
};

const loginBusiness = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ msg: "Please add data." });

    const { email, password } = req.body;
    const business = await Business.findOne({ email });

    if (!business) {
      return res.status(200).json({
        ids: null,
      });
    }

    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) {
      return res.status(200).json({
        ids: null,
      });
    }

    const { _id, productId, orderId } = business;

    res.status(200).json({
      ids: {
        businessId: _id,
        productId,
        orderId,
      },
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
