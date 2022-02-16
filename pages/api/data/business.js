import dbConnect from "../../../db/database";
import Business from "../../../models/business";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getBusiness(req, res);
};

const getBusiness = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    // const { businessId } = req.body;

    const { businessId } = session.user;
    const business = await Business.findById(businessId);

    // if (!business) {
    //   return res.status(200).json({
    //     businessData: null,
    //   });
    // }

    res.status(200).json({
      business,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};
