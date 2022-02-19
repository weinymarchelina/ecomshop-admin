import dbConnect from "../../../db/database";
import Business from "../../../models/business";
import Admin from "../../../models/admin";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getBusiness(req, res);
};

const getBusiness = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { businessId, userId, role } = session.user;
    const business = await Business.findById(businessId);
    const user = await Admin.findById(userId);

    if (!user) {
      return res.status(200).json({
        business: null,
        promoted: null,
      });
    }

    if (role !== user.role) {
      return res.status(200).json({
        business,
        promoted: true,
      });
    }

    res.status(200).json({
      business,
      promoted: false,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};
