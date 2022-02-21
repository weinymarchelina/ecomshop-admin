import dbConnect from "../../../db/database";
import Product from "../../../models/product";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await addProduct(req, res);
};

const addProduct = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const business = await new Product(req.body).save();
    console.log("Business: ");
    console.log(business);

    res.status(200).json({
      msg: `A new product has been created`,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
