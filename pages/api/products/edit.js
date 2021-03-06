import dbConnect from "../../../db/database";
import Product from "../../../models/product";
import { getSession } from "next-auth/react";
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_API_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      deletedLinks,
    } = req.body;

    for (const link of deletedLinks) {
      cloudinary.uploader
        .destroy(link.substring(64, 104), (error, result) => {
          console.log(result, error);
        })
        .then((resp) => console.log(resp))
        .catch((_err) => {
          console.log(_err);
          console.log("Something went wrong, please try again later.");
        });
    }

    await Product.updateOne(
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

    res.status(200).json({
      msg: `Product information has been successfully changed`,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
