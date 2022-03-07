import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  Modal,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import useMediaQuery from "@mui/material/useMediaQuery";
import moment from "moment";
import { SettingsApplications } from "@mui/icons-material";

// const idLocale = require("moment/locale/id");
// moment.locale("id", idLocale);

const formatter = new Intl.NumberFormat("id", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: "95vw",
  maxWidth: "calc(25rem + 30vw)",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 5,
  mr: 1,
};

const OrderList = ({ user }) => {
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:560px)");
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState({});
  const router = useRouter();

  useEffect(async () => {
    try {
      const res = await axios.get("/api/data/order");
      const { orderData, productData } = res.data;

      for (const order of orderData) {
        const firstProduct = productData.filter(
          (product) => product._id === order.itemList[0].productId
        );
        order.firstItemInfo = order.itemList[0];
        order.firstItem = firstProduct[0];
        order.productQty = order.itemList.length;

        for (const item of order.itemList) {
          const product = productData.filter(
            (product) => product._id === item.productId
          );
          item.priceList = product[0].price;
        }
      }

      console.log(orderData);

      setOrders(orderData);
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }, []);

  const getStatus = (order) => {
    if (order.doneStatus) {
      return "Finished";
    } else if (order.finishDate === "-") {
      return "Canceled";
    } else {
      return "On Process";
    }
  };

  const getColor = (order) => {
    if (order.doneStatus) {
      return "green";
    } else if (order.finishDate === "-") {
      return "#ccc";
    } else {
      return "#eee";
    }
  };

  const handleEdit = (order) => {
    router.push(`/order/edit/${order._id}`);
  };
  const handleCancel = (order) => {
    //
    console.log("Cancel!");
  };
  const handleFinish = (order) => {
    //
    console.log("Finish");
  };

  return (
    <Container
      sx={{
        pt: 5,
        pb: 5,
      }}
      maxWidth="lg"
    >
      {orders && (
        <Box className="f-row" variant="outlined">
          <Box className="f-col" sx={{ width: "100%" }}>
            <Box
              className="f-space"
              sx={{
                mt: 2,
                mb: 1,
                flex: 1,
                alignItems: "center",
              }}
            >
              <Typography
                className="main-title"
                variant={matches ? "h5" : "h4"}
                component="h2"
              >
                Transaction List
              </Typography>
            </Box>

            {open && (
              <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={modalStyle}>
                  <Box className="f-column">
                    <Typography variant="h6" component="p">
                      Are you sure to {action.name} this order?
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      component="p"
                      color="primary"
                      sx={{ my: 3 }}
                    >
                      Warning: this action is irreversible!
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      <Button
                        variant="outlined"
                        sx={{ mr: 1 }}
                        onClick={() => action.func(action.order)}
                      >
                        {action.name} Order
                      </Button>
                      <Button
                        variant="contained"
                        sx={{ ml: 1 }}
                        onClick={() => setOpen(false)}
                      >
                        Back
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Modal>
            )}

            <Box sx={{ mt: 2 }}>
              {orders.map((order) => {
                return (
                  <Box key={order._id}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          opacity: 0.85,
                        },
                        mb: 3,
                      }}
                      onClick={() => router.push(`/order/${order._id}`)}
                    >
                      <CardContent
                        className="f-col"
                        sx={{ justifyContent: "center" }}
                      >
                        <Box
                          sx={{ pb: 1 }}
                          style={{ borderBottom: "1px solid #ccc" }}
                        >
                          <Typography variant="caption" component="p">
                            Order from {order.customerName}
                          </Typography>
                        </Box>
                        <Box className={stacks ? "f-col" : "f-space"}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: `${stacks ? "center" : "flex-start"}`,
                              my: 2,
                            }}
                          >
                            <Box>
                              <img
                                src={order.firstItem.image[0]}
                                alt={`${order.firstItem.name}-img`}
                                style={{
                                  width: `${
                                    stacks ? "3.75rem" : "calc(5rem + 1vw)"
                                  }`,
                                  height: `${
                                    stacks ? "3.75rem" : "calc(5rem + 1vw)"
                                  }`,
                                  margin: "0 .5rem",
                                }}
                              />
                            </Box>
                            <Box
                              sx={{
                                px: 1,
                                mt: 1,
                                width: `${
                                  matches ? "calc(37.5vw + 5rem)" : "100%"
                                }`,
                              }}
                            >
                              <Typography
                                sx={{ mr: 3, fontSize: "0.6rem" }}
                                component="p"
                              >
                                {moment(order.createdAt).format("LLL")}
                              </Typography>
                              <Typography
                                variant="body1"
                                component="h2"
                                noWrap
                                sx={{ width: "100%" }}
                              >
                                {order.firstItem.name}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex-col",
                                  alignItems: "flex-end",
                                }}
                              >
                                <Typography variant="caption" component="p">
                                  {order.itemList[0].quantity} pcs x{" "}
                                  {formatter.format(order.itemList[0].price)}
                                </Typography>

                                {order.productQty > 1 && (
                                  <Typography
                                    variant="caption"
                                    component="p"
                                    sx={{ mt: 1 }}
                                  >
                                    + {order.productQty - 1} other product
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: `${
                                stacks ? "row-reverse" : "column"
                              }`,
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="caption"
                                component="p"
                                className="main-title"
                                textAlign="center"
                                sx={{
                                  fontSize: `${stacks ? "0.75rem" : "0.7rem"}`,
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: "0.35vw",
                                  backgroundColor: getColor(order),
                                }}
                              >
                                {getStatus(order)}
                              </Typography>
                            </Box>
                            <Box sx={{ mr: 2 }}>
                              <Typography
                                sx={{
                                  textTransform: "uppercase",
                                }}
                                variant="caption"
                                component="p"
                              >
                                Total
                              </Typography>
                              <Typography variant="p" fontWeight={500}>
                                {formatter.format(order.totalPrice)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            mt: 3,
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {!order.doneStatus && (
                              <>
                                <Button
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(true);
                                    setAction({
                                      name: "cancel",
                                      func: handleCancel,
                                      order,
                                    });
                                    // handleCancel(order);
                                  }}
                                  variant="outlined"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(order);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(true);
                                    setAction({
                                      name: "finish",
                                      func: handleFinish,
                                      order,
                                    });
                                  }}
                                >
                                  Finish
                                </Button>
                              </>
                            )}
                            {order.doneStatus && user.role === "Owner" && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleEdit(order)}
                              >
                                Edit
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default OrderList;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/store",
        permanent: false,
      },
    };
  }

  return {
    props: { user: session.user },
  };
}
