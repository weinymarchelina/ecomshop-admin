import dbConnect from "../../../db/database";
import Admin from "../../../models/admin";
import Business from "../../../models/business";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getUser(req, res);
};

const getUser = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { userId, businessId } = session.user;
    const user = await Admin.findById(userId);
    const business = await Business.findById(businessId);

    if (user) {
      return res.status(200).json({
        userStatus: true,
        business,
      });
    } else {
      res.status(200).json({
        userStatus: false,
      });
    }
  } catch (err) {
    return res.status(500).json(err);
  }
};
