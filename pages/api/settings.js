import dbConnect from "../../db/database";
import Business from "../../models/Business";
import User from "../../models/User";
import { getSession } from "next-auth/react";
import bcrypt from "bcrypt";

dbConnect();

export default async (req, res) => {
  await kickEmployee(req, res);
};

const kickEmployee = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { inputPass, employeeId, employeeEmail, businessId } = req.body;

    const business = await Business.findById(businessId);
    const isMatch = await bcrypt.compare(inputPass, business.password);
    if (!isMatch) {
      return res.status(403).json({
        msg: "Password is incorrect",
      });
    }

    await Business.updateOne(
      { _id: businessId },
      {
        $pull: {
          team: {
            email: employeeEmail,
          },
        },
      },
      {
        multi: true,
      }
    );

    await User.findByIdAndDelete(employeeId).then((user) => {
      res.status(200).json({
        msg: `You have kicked ${user.name}`,
      });
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
