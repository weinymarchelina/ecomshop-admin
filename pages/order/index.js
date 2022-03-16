import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  Modal,
  FormControl,
  TextField,
  Select,
  InputLabel,
  MenuItem,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import useMediaQuery from "@mui/material/useMediaQuery";
import moment from "moment";

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

const startDayWeek = moment(new Date()).startOf("week").format("MMM Do");
const lastDayWeek = moment(new Date()).endOf("week").format("MMM Do");
const startDayMonth = moment(new Date()).startOf("month").format("MMM Do");
const lastDayMonth = moment(new Date()).endOf("month").format("MMM Do");
const startDayOfPrevWeek = moment(new Date()).startOf("week").format("lll");
const lastDayOfPrevWeek = moment(new Date()).endOf("week").format("lll");
const startDayOfMonth = moment(new Date()).startOf("month").format("lll");
const lastDayOfMonth = moment(new Date()).endOf("month").format("lll");
const today = moment(new Date()).format("MMM Do");

const OrderList = ({ user }) => {
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:560px)");
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const filterList = [
    "Unfinished",
    "Finished",
    "Canceled",
    `Today (${today})`,
    `This Week (${startDayWeek} - ${lastDayWeek})`,
    `This Month (${startDayMonth} - ${lastDayMonth})`,
  ];
  const router = useRouter();

  useEffect(async () => {
    try {
      const res = await axios.get("/api/data/order");
      const { orderData, productData, userData } = res.data;

      for (const order of orderData) {
        const firstProduct = productData.filter(
          (product) => product._id === order.itemList[0].productId
        );
        order.firstItemInfo = order.itemList[0];
        order.firstItem = firstProduct[0];
        order.productQty = order.itemList.length;

        const theUser = userData.filter(
          (user) => user._id === order.customerId
        );
        if (theUser[0]) order.customName = theUser[0].contactInfo.name;

        for (const item of order.itemList) {
          const product = productData.filter(
            (product) => product._id === item.productId
          );
          item.priceList = product[0].price;
        }
      }

      setOrders(orderData);
    } catch (err) {
      console.log(err.message);
      console.log(err.response.data);
      throw new Error(err.message);
    }
  }, []);

  const searchOrder = () => {
    if (searchTerm) {
      const getOrders = orders.filter((order) => {
        const name = order.customName ? order.customName : order.customerName;

        return name.toLowerCase().includes(searchTerm);
      });

      return getOrders;
    } else if (filter === "All") return orders;
    else return orders;
  };

  const searchedOrder = searchOrder();

  const filterOrders = () => {
    let filteredOrders;

    if (filter !== "All") {
      switch (filter) {
        case "Unfinished":
          filteredOrders = searchedOrder.filter((order) => !order.doneStatus);

          break;

        case "Finished":
          filteredOrders = searchedOrder.filter(
            (order) => order.doneStatus && order.finishDate !== "-"
          );

          break;

        case "Canceled":
          filteredOrders = searchedOrder.filter(
            (order) => order.doneStatus && order.finishDate === "-"
          );
          break;

        case "Today":
          filteredOrders = searchedOrder.filter(
            (order) =>
              moment(new Date(order.createdAt)).format("LL") ===
              moment(new Date()).format("LL")
          );

          break;

        case `This Week (${startDayWeek} - ${lastDayWeek})`:
          filteredOrders = searchedOrder.filter((order) => {
            const orderDate = moment(new Date(order.createdAt)).format("lll");

            return moment(new Date(orderDate)).isBetween(
              startDayOfPrevWeek,
              lastDayOfPrevWeek
            );
          });

          break;

        case `This Month (${startDayMonth} - ${lastDayMonth})`:
          filteredOrders = searchedOrder.filter((order) => {
            const orderDate = moment(new Date(order.createdAt)).format("lll");

            return moment(new Date(orderDate)).isBetween(
              startDayOfMonth,
              lastDayOfMonth
            );
          });

          break;

        default:
          filteredOrders = orders;

          break;
      }
    } else if (searchTerm && filter === "All") {
      filteredOrders = searchedOrder;
    } else {
      filteredOrders = orders;
    }

    return filteredOrders;
  };
  const newOrders = filterOrders();

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
      await axios.post("/api/order/done", {
        order,
        done: false,
      });
      window.location.reload();
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
      window.location.reload();
    } catch (err) {
      console.log(err.message);
      console.log(err.response.data);
      throw new Error(err.message);
    }
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

            {newOrders && (
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent
                  className={`${matches ? "f-col" : "f-space"}`}
                  sx={{ alignItems: "center", py: 3, gap: 3 }}
                >
                  <Box
                    className="f-space"
                    sx={{ flex: 2, gap: 3, width: "100%" }}
                  >
                    <FormControl variant="standard" sx={{ flex: 1 }}>
                      <InputLabel>Filter</InputLabel>
                      <Select
                        value={filter}
                        label="Category"
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <MenuItem value="All">
                          <Typography variant="subtitle1" component="p">
                            All
                          </Typography>
                        </MenuItem>
                        {filterList.map((filter) => (
                          <MenuItem key={filter} value={filter}>
                            <Typography variant="subtitle1" component="p">
                              {filter}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <TextField
                    onChange={(e) => setSearchTerm(e.target.value)}
                    label="Search Customer"
                    variant="standard"
                    sx={{ flex: 2, pt: 0.65 }}
                    autoComplete="off"
                    fullWidth
                  />
                </CardContent>
              </Card>
            )}

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

            {newOrders && (
              <Box sx={{ mt: 2 }}>
                {newOrders.map((order) => {
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
                              Order from{" "}
                              {order.customName
                                ? order.customName
                                : order.customerName}
                            </Typography>
                          </Box>
                          <Box className={stacks ? "f-col" : "f-space"}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: `${
                                  stacks ? "center" : "flex-start"
                                }`,
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
                                    fontSize: `${
                                      stacks ? "0.75rem" : "0.7rem"
                                    }`,
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: "0.35vw",
                                  }}
                                  style={getStyle(order)}
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
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
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
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { user: session.user },
  };
}
