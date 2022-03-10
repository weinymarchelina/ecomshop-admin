import dbConnect from "../../../db/database";
import Product from "../../../models/product";
import { getSession } from "next-auth/react";
import axios from "axios";

dbConnect();

export default async (req, res) => {
  await editStock(req, res);
};

const editStock = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const products = req.body;

    products.map(async (product) => {
      const result = await Product.updateOne(
        { _id: product._id },
        {
          stockQty: product.stockQty,
        }
      );
      console.log(result);
    });

    await res.status(200).json({
      msg: "Products updated",
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

//   console.log(originalProducts);
//   const theOriginal = originalProducts.filter(
//     (item) => item._id === product._id
//   );

//   console.log(theOriginal);
//   const theOri = theOriginal[0];
//   if (theOri === []) {
//     return;
//   }

//   if (product.stockQty !== theOri?.stockQty) {
//     console.log(product.name + ": " + product.stockQty);
//     const result = await Product.updateOne(
//       { _id: product._id },
//       {
//         stockQty: product.stockQty,
//       }
//     );
//     console.log(result);
//   }
