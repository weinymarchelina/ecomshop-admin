import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getCookie, removeCookies } from "cookies-next";
const User = require("../../../models/user");
const Business = require("../../../models/business");
const Product = require("../../../models/product");
const Order = require("../../../models/order");
import dbConnect from "../../../db/database";

dbConnect();

const createOptions = (req, res) => ({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  jwt: {
    encryption: true,
  },
  session: { jwt: true },
  secret: process.env.SECRET,
  database: process.env.DB_STRING,
  theme: {
    colorScheme: "light",
    brandColor: "#202020",
    logo: "/svg-auth.svg", // Absolute URL to image
  },
  session: { jwt: true },
  callbacks: {
    async jwt({ token, account }) {
      // if authed then just skip the checking or registering process
      if (!getCookie("status", { req, res })) {
        return token;
      }

      // if unauthed then start checking or registering:
      const status = await JSON.parse(getCookie("status", { req, res }));
      const { businessId, role } = status;

      if (account) {
        token.accessToken = account.access_token;
      }

      // checking whether the user is an old or new user
      const oldUser = await User.findOne({ email: token.email });

      // no businessId means the user is an old user,  user with businessId means they are new user
      if (!oldUser && businessId) {
        if (role === "Employee") {
          // login business acc (check in as team)
          await checkInBusiness(token, status);

          return token;
        } else if (role === "Owner") {
          // Create business acc
          await registerBusiness(token, status);

          return token;
        }

        removeCookies("status", { req, res });
        return token;
      }

      if (oldUser.businessId) {
        // getting the businessId back for the old user
        const { businessId, productId, orderId, _id, role } = oldUser;
        token.businessId = businessId;
        token.productId = productId;
        token.orderId = orderId;
        token.userId = _id;
        token.role = role;
        removeCookies("status", { req, res });

        return token;
      } else {
        return true;
      }
    },
    async session({ session, token, user }) {
      session.user.role = token.role;
      session.user.businessId = token.businessId;
      session.user.productId = token.productId;
      session.user.orderId = token.orderId;
      session.user.userId = token.userId;

      return session;
    },
  },
});

export default async (req, res) => {
  return NextAuth(req, res, createOptions(req, res));
};

const checkInBusiness = async (token, status) => {
  // * CREATE USER
  const { businessId, productId, orderId, role } = status;

  const userData = {
    name: token.name,
    email: token.email,
    picture: token.picture,
    role,
    businessId,
  };

  token.role = role;
  token.businessId = businessId;
  token.productId = productId;
  token.orderId = orderId;

  const user = await new User(userData).save();
  token.userId = user._id;

  // * ADD USER TO BUSINESS
  await Business.updateOne(
    { _id: businessId },
    {
      $push: {
        team: {
          name: token.name,
          email: token.email,
          picture: token.picture,
          role,
          userId: user._id,
        },
      },
    }
  );
};

const registerBusiness = async (token, status) => {
  // * CREATE BUSINESS
  const { name, phone, email, password, role } = status;

  const data = {
    name,
    phone,
    email,
    password,
    team: [],
  };

  const business = await new Business(data).save();
  const product = await new Product({
    businessId: business._id,
    product: [],
  }).save();
  const order = await new Order({
    businessId: business._id,
    order: [],
  }).save();

  await Business.findByIdAndUpdate(
    { _id: business._id },
    { productId: product._id, orderId: order._id }
  );

  // * CREATE USER
  const userData = {
    name: token.name,
    email: token.email,
    picture: token.picture,
    role,
    businessId: business._id,
  };

  console.log(business);
  console.log(business.id);
  console.log(business._id);

  token.role = role;
  token.businessId = business.id;
  token.productId = product.id;
  token.orderId = order.id;

  const user = await new User(userData).save();
  token.userId = user._id;

  // * ADD USER TO BUSINESS
  await Business.updateOne(
    { _id: business.id },
    {
      $push: {
        team: {
          name: token.name,
          email: token.email,
          picture: token.picture,
          role,
          userId: user._id,
        },
      },
    }
  );
};
