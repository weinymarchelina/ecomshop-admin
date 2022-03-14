import dbConnect from "../../../db/database";
import Business from "../../../models/business";
import { getSession } from "next-auth/react";
const ObjectId = require("mongodb").ObjectId;

dbConnect();

export default async (req, res) => {
  await editCategory(req, res);
};

const editCategory = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { businessId } = session.user;

    const setList = req.body.map((name) => {
      return {
        name: name,
        _id: ObjectId(),
      };
    });

    const response = await Business.updateOne(
      { _id: businessId },
      {
        category: setList,
      }
    );

    res.status(200).json({
      msg: `Category list has been successfully updated`,
      res: response,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
