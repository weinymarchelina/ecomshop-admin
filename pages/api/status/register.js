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

    // const team = [
    //   {
    //     name: session.user.name,
    //     email: session.user.email,
    //     image: session.user.image,
    //     userId: session.userId,
    //     role: "Owner",
    //   },
    // ];

    // const data = {
    //   name,
    //   phone,
    //   email,
    //   password: hashPass,
    //   team: [],
    // };

    // // save business
    // const business = await new Business(data).save();

    // const product = await new Product({
    //   businessId: business._id,
    //   product: [],
    // }).save();

    // const order = await new Order({
    //   businessId: business._id,
    //   order: [],
    // }).save();

    // await Business.findByIdAndUpdate(
    //   { _id: business._id },
    //   { productId: product._id, orderId: order._id }
    // )
    //   .then(() => {
    //     res.status(200).json({
    //       ids: {
    //         businessId: business._id,
    //         productId: product._id,
    //         orderId: order._id,
    //       },
    //     });
    //   })
    //   .catch((error) => {
    //     res.status(500).json({ msg: err.message });
    //   });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
