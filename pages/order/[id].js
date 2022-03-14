import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  Modal,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

// const idLocale = require("moment/locale/id");
// moment.locale("id", idLocale);

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

const DisplayOrder = ({ user }) => {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState({});
  const switchNav = useMediaQuery("(max-width:900px)");
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:560px)");

  const formatter = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  useEffect(async () => {
    const { id } = router.query;
    try {
      const res = await axios.post("/api/order/", { orderId: id });
      const { orderData, productData } = res.data;
      const orderedProductList = orderData.itemList.map((item) => {
        const orderedProducts = productData.filter(
          (product) => product._id === item.productId
        );
        const productObj = orderedProducts[0];
        productObj.orderedQty = item.quantity;
        productObj.orderedPrice = item.price;

        return productObj;
      });
      setProducts(orderedProductList);
      setOrder(orderData);
    } catch (err) {
      console.log(err.message);
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  }, [id]);

  const getStatus = (order) => {
    if (order.finishDate === "-") {
      return "Canceled";
    } else if (order.doneStatus && order.finishDate !== "-") {
      return "Finished";
    } else {
      return "On Process";
    }
  };

  const getStyle = (order) => {
    if (order.finishDate === "-") {
      return {
        backgroundColor: "#ccc",
      };
    } else if (order.doneStatus && order.finishDate !== "-") {
      return {
        backgroundColor: "#58B24D",
        color: "#fff",
      };
    } else {
      return {
        backgroundColor: "#eee",
      };
    }
  };

  const handleEdit = (order) => {
    router.push(`/order/edit/${order._id}`);
  };

  const handleCancel = async (order) => {
    try {
      const res = await axios.post("/api/order/done", {
        order,
        done: false,
      });
      const { msg } = res.data;
      router.push("/order");
    } catch (err) {
      console.log(err.message);
      console.log(err.response.data);
      throw new Error(err.message);
    }
  };

  const handleFinish = async (order) => {
    try {
      const res = await axios.post("/api/order/done", {
        order,
        done: true,
      });
      const { msg } = res.data;
      router.push("/order");
    } catch (err) {
      console.log(err.message);
      console.log(err.response.data);
      throw new Error(err.message);
    }
  };
  return (
    <Container
      sx={{
        py: 5,
      }}
      maxWidth="lg"
    >
      {products && (
        <Box className="f-row" variant="outlined">
          <Box className="f-col" sx={{ width: "100%" }}>
            <Box
              className={stacks ? "f-col" : "f-space"}
              sx={{
                mt: 2,
                mb: 1,
                flex: 1,
                alignItems: `${stacks ? "flex-start" : "center"}`,
              }}
            >
              <Typography
                className="main-title"
                variant={matches ? "h5" : "h4"}
                component="h2"
              >
                Order Details
              </Typography>
            </Box>
            {order && (
              <Card
                variant="outlined"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1,
                  mt: 2,
                }}
              >
                <Typography
                  style={{
                    marginRight: `${matches ? "0" : "2rem"}`,
                  }}
                  variant={stacks ? "caption" : "body1"}
                  fontWeight="bold"
                >
                  Status
                </Typography>
                <Typography
                  variant="caption"
                  component="p"
                  className="main-title"
                  textAlign="center"
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: "0.35vw",
                  }}
                  style={getStyle(order)}
                >
                  {getStatus(order)}
                </Typography>
              </Card>
            )}
            <Box>
              {products.map((product) => {
                return (
                  <Box
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.85,
                      },
                    }}
                    key={product._id}
                    onClick={() => router.push(`/products`)}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        backgroundColor: `${
                          product.stockQty === 0 ? "#aaa" : "transparent"
                        }`,
                      }}
                    >
                      <CardContent className={switchNav ? "f-col" : "f-space"}>
                        <Box className="f-row">
                          <Box>
                            <img
                              src={product.image[0]}
                              alt={`${product.name}-img`}
                              style={{
                                width: `${
                                  stacks ? "3.75rem" : "calc(5rem + 1vw)"
                                }`,
                                height: `${
                                  stacks ? "3.75rem" : "calc(5rem + 1vw)"
                                }`,
                                margin: "0 .5rem",
                                opacity: `${product.stockQty === 0 ? 0.7 : 1}`,
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              px: 1,
                              flex: 1,
                              width: `${matches ? "9rem" : "auto"}`,
                            }}
                          >
                            <Typography
                              variant="body1"
                              component="h2"
                              noWrap
                              sx={{ width: "100%" }}
                            >
                              {product.name}
                            </Typography>
                            <Box
                              sx={{ display: "flex", alignItems: "flex-end" }}
                            >
                              <Typography component="p" fontWeight={"bold"}>
                                {formatter.format(product.orderedPrice)}
                              </Typography>
                              <Typography
                                sx={{
                                  ml: 1,
                                  mb: 0.25,
                                }}
                                variant="caption"
                                component="p"
                              >
                                {`(${product.orderedQty} pcs)`}
                              </Typography>
                            </Box>
                            <Typography variant="caption" component="p">
                              Total:{" "}
                              {formatter.format(
                                product.orderedPrice * product.orderedQty
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
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
                        onClick={(e) => {
                          e.target.disabled = true;
                          action.func(action.order);
                        }}
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
            {order && (
              <>
                <Card
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography variant={stacks ? "caption" : "body1"}>
                    Customer Name
                  </Typography>
                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                  >
                    {order.customerName}
                  </Typography>
                </Card>
                <Card
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography variant={stacks ? "caption" : "body1"}>
                    Order Date
                  </Typography>
                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                  >
                    {moment(new Date(order.createdAt)).format("LLL")}
                  </Typography>
                </Card>

                {order.doneStatus && (
                  <Card
                    variant="outlined"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1,
                    }}
                  >
                    <Typography variant={stacks ? "caption" : "body1"}>
                      Finish Date
                    </Typography>
                    <Typography
                      variant={stacks ? "caption" : "body1"}
                      textAlign="right"
                    >
                      {moment(new Date(order.finishDate)).format("LLL")}
                    </Typography>
                  </Card>
                )}

                <Card
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography variant={stacks ? "caption" : "body1"}>
                    Note
                  </Typography>
                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                  >
                    {order.note ? order.note : "-"}
                  </Typography>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography
                    style={{
                      marginRight: `${matches ? "0" : "2rem"}`,
                    }}
                    variant={stacks ? "caption" : "body1"}
                  >
                    Payment Method
                  </Typography>
                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                  >
                    {order.paymentMethod}
                  </Typography>
                </Card>
                <Card
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography variant={stacks ? "caption" : "body1"}>
                    Total Order {`(${order.totalQty} Items)`}
                  </Typography>
                  <Typography
                    sx={{ textAlign: "right" }}
                    variant={stacks ? "caption" : "body1"}
                  >
                    {formatter.format(order.totalPrice)}
                  </Typography>
                </Card>
                <Box
                  sx={{
                    display: "flex",
                    mt: 3,
                    gap: 1,
                    justifyContent: "flex-end",
                  }}
                >
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
                        }}
                        variant="outlined"
                      >
                        Cancel
                      </Button>
                      {order.finishDate === "-" || (
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
                      )}
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
                  {order.doneStatus &&
                    order.finishDate !== "-" &&
                    user.role === "Owner" && (
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
                    )}
                </Box>
              </>
            )}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default DisplayOrder;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { user: session.user },
  };
}
