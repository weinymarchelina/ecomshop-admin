import dbConnect from "../../../db/database";
import Product from "../../../models/product";
import Order from "../../../models/order";
import { getSession } from "next-auth/react";
import axios from "axios";

dbConnect();

export default async (req, res) => {
  await addOrder(req, res);
};

const addOrder = async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) return res.status(400).json({ msg: "Please login first." });

    const { totalPrice, totalQty, itemList, orderId, orderOriItem, products } =
      req.body;

    await Order.updateOne(
      { _id: orderId },
      {
        totalPrice,
        totalQty,
        itemList,
      }
    );

    // for (const product of products) {
    //   const result = await Product.updateOne(
    //     { _id: product.productId },
    //     {
    //       stockQty: product.stockQty,
    //     }
    //   );
    //   console.log(result)
    // }

    const updateProducts = products.map(async (product) => {
      console.log(product.name + ": " + product.stockQty);
      const result = await Product.updateOne(
        { _id: product._id },
        {
          stockQty: product.stockQty,
        }
      );
      console.log(result);
    });

    // for (const product of products) {
    //   const theOrderedQty = orderOriItem.find(
    //     (item) => item.productId === product._id
    //   );

    //   const currentStock =
    //     product.stockQty + theOrderedQty.quantity - product.orderedQty;

    //   console.log(`
    //   Product name: ${product.name}
    //   Original Stock: ${product.stockQty + theOrderedQty.quantity}
    //   Purchased: ${product.orderedQty}
    //   Current Stock: ${currentStock}
    //   `);

    //   const result = await Product.updateOne(
    //     { _id: product.productId },
    //     {
    //       stockQty: currentStock,
    //     }
    //   );

    //   const productData = await Product.findById(product.productId);
    //   console.log(productData);
    // }

    // const newProducts = products.map(async (product) => {
    //   const theOrderedQty = orderOriItem.find(
    //     (item) => item.productId === product._id
    //   );

    //   const currentStock =
    //     product.stockQty + theOrderedQty.quantity - product.orderedQty;

    //   console.log(`
    //     Product name: ${product.name}
    //     Original Stock: ${product.stockQty + theOrderedQty.quantity}
    //     Purchased: ${product.orderedQty}
    //     Current Stock: ${currentStock}
    //     `);

    //   const result = await Product.updateOne(
    //     { _id: product.productId },
    //     {
    //       stockQty: currentStock,
    //     }
    //   );

    //   const productData = await Product.findById(product.productId);
    //   console.log(productData);
    //   return await productData;
    // });

    const newOrder = await axios
      .all(updateProducts)
      .then(async (updateProducts) => {
        console.log(updateProducts);

        const orderData = await Order.findById(orderId);
        return orderData;
      });

    await res.status(200).json({
      msg: newOrder,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
