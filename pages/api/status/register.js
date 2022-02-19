import dbConnect from "../../../db/database";
import Business from "../../../models/business";
import bcrypt from "bcrypt";

dbConnect();

export default async (req, res) => {
  await createBusiness(req, res);
};

const createBusiness = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ msg: "Please add data." });
    const { name, phone, email, password } = await req.body;

    //
    const acc = await Business.findOne({ email });
    if (acc) {
      return res.status(200).json({
        businessForm: null,
      });
    }

    // hash password
    const salt = await bcrypt.genSalt();
    const hashPass = await bcrypt.hash(password, salt);
    res.status(200).json({
      businessForm: {
        name,
        phone,
        email,
        password: hashPass,
        businessId: "business is in registering process",
      },
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
