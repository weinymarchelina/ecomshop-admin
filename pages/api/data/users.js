import dbConnect from "../../../db/database";
import User from "../../../models/user";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getUsers(req, res);
};

const getUsers = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { businessId } = session.user;

    const users = await User.find({ businessId });

    res.status(200).json({
      users,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
