import dbConnect from "../../db/database";
import User from "../../models/user";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await getUser(req, res);
};

const getUser = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { userId } = session.user;
    const user = await User.findById(userId);

    if (user) {
      return res.status(200).json({
        userStatus: true,
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