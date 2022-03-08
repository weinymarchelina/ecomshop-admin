import dbConnect from "../../../db/database";
import User from "../../../models/user";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await updateContact(req, res);
};

const updateContact = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const userList = req.body;
    console.log("user list");
    console.log(userList);

    for (const user of userList) {
      await User.updateOne(
        { _id: user._id },
        {
          contactInfo: user.contactInfo,
        }
      );
    }

    res.status(200).json({
      msg: `A new product has been created`,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
