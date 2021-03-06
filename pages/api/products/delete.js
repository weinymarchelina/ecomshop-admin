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
  await deleteProduct(req, res);
};

const deleteProduct = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { selectedProduct } = req.body;

    await Product.findByIdAndDelete(selectedProduct._id);

    for (const link of selectedProduct.image) {
      cloudinary.uploader
        .destroy(link.substring(64, 104), (error, result) => {
          console.log(result, error);
        })
        .then((resp) => console.log(resp))
        .catch((_err) =>
          console.log("Something went wrong, please try again later.")
        );
    }

    res
      .status(200)
      .json({ msg: `${selectedProduct.name} has been successfully deleted` });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
