import dbConnect from "../../db/database";
import Business from "../../models/business";
import User from "../../models/user";
import { getSession } from "next-auth/react";
import bcrypt from "bcrypt";

dbConnect();

export default async (req, res) => {
  await switchRole(req, res);
};

const switchRole = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const {
      inputPass,
      ownerId,
      ownerEmail,
      employeeId,
      employeeEmail,
      businessId,
    } = req.body;

    const business = await Business.findById(businessId);
    const isMatch = await bcrypt.compare(inputPass, business.password);
    if (!isMatch) {
      return res.status(403).json({
        msg: "Password is incorrect",
      });
    }

    await Business.updateOne(
      { _id: businessId, "team.email": ownerEmail },
      {
        $set: {
          "team.$.role": "Employee",
        },
      }
    );
    await User.updateOne(
      { _id: ownerId },
      {
        role: "Employee",
      }
    );

    await Business.updateOne(
      { _id: businessId, "team.email": employeeEmail },
      {
        $set: {
          "team.$.role": "Owner",
        },
      }
    );
    await User.updateOne(
      { _id: employeeId },
      {
        role: "Owner",
      }
    );

    res.status(200).json({
      msg: `You have changed the role`,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
