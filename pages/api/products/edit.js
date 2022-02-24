import dbConnect from "../../../db/database";
import Product from "../../../models/product";
import { getSession } from "next-auth/react";

dbConnect();

export default async (req, res) => {
  await editProduct(req, res);
};

const editProduct = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const {
      name,
      category,
      desc,
      image,
      stockQty,
      warningQty,
      activeStatus,
      price,
      id,
    } = req.body;

    const response = await Product.updateOne(
      { _id: id },
      {
        name,
        category,
        desc,
        image,
        stockQty,
        warningQty,
        activeStatus,
        price,
      }
    );
    console.log(response);

    res.status(200).json({
      msg: `Product information has been successfully changed`,
      res: response,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
