import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  IconButton,
  TextField,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

// const idLocale = require("moment/locale/id");
// moment.locale("id", idLocale);

const DisplayReport = ({ user }) => {
  const router = useRouter();

  const startHours = new Date().setHours(0, 0, 0, 0);
  const endHours = new Date().setHours(23, 59, 59, 999);
  const today = moment(new Date()).format();
  const thisWeekStart = moment(new Date()).startOf("week").format();
  const thisWeekEnd = moment(new Date()).endOf("week").format();
  const thisMonthStart = moment(new Date()).startOf("month").format();
  const thisMonthEnd = moment(new Date()).endOf("month").format();
  const prevMonthStart = moment(new Date())
    .subtract(1, "months")
    .startOf("month")
    .format();
  const prevMonthEnd = moment(new Date())
    .subtract(1, "months")
    .endOf("month")
    .format();

  const showDate = {
    today: moment(new Date()).format("lll"),
    thisWeekStart: moment(new Date()).startOf("week").format("MMM Do"),
    thisWeekEnd: moment(new Date()).endOf("week").format("MMM Do"),
    thisMonthStart: moment(new Date()).startOf("month").format("MMM Do"),
    thisMonthEnd: moment(new Date()).endOf("month").format("MMM Do"),
    prevMonthStart: moment(new Date())
      .subtract(1, "months")
      .startOf("month")
      .format("MMM Do"),
    prevMonthEnd: moment(new Date())
      .subtract(1, "months")
      .endOf("month")
      .format("MMM Do"),
  };

  const [report, setReport] = useState(null);
  const [total, setTotal] = useState(0);
  const [start, setStart] = useState(moment(startHours).format());
  const [end, setEnd] = useState(moment(endHours).format());
  const [filter, setFilter] = useState("Today");
  const filterList = [
    `This Week (${showDate.thisWeekStart} - ${showDate.thisWeekEnd})`,
    `This Month (${showDate.thisMonthStart} - ${showDate.thisMonthEnd})`,
    `Last Month (${showDate.prevMonthStart} - ${showDate.prevMonthEnd})`,
    "All",
  ];

  const switchNav = useMediaQuery("(max-width:900px)");
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:560px)");

  const formatter = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  useEffect(async () => {
    console.log(startHours);
    try {
      const res = await axios.post("/api/data/report", {
        start: thisWeekStart,
        end: thisWeekEnd,
      });
      // const res = await axios.post("/api/data/report", { start, end });
      console.log(res.data);
      const { report } = res.data;
      const subtotal = report
        .map((item) => item.amount)
        .reduce((partialSum, a) => partialSum + a, 0);
      const soldItem = report
        .map((item) => item.buyedQty)
        .reduce((partialSum, a) => partialSum + a, 0);

      setTotal({
        subtotal,
        soldItem,
      });

      console.log(report);
      setReport(report);
    } catch (err) {
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  }, []);

  // const filterOrders = () => {
  //   let filteredOrders;
  //   console.log("filtered");
  //   console.log(filter);

  //   switch (filter) {
  //     case `This Week (${showDate.thisWeekStart} - ${showDate.thisWeekEnd})`:
  //       filteredOrders = searchedOrder.filter((order) => {
  //         const orderDate = moment(new Date(order.createdAt)).format("lll");

  //         return moment(new Date(orderDate)).isBetween(
  //           startDayOfPrevWeek,
  //           lastDayOfPrevWeek
  //         );
  //       });

  //       break;

  //     case `This Month (${showDate.thisMonthStart} - ${showDate.thisMonthEnd})`:
  //       filteredOrders = searchedOrder.filter((order) => {
  //         const orderDate = moment(new Date(order.createdAt)).format("lll");

  //         return moment(new Date(orderDate)).isBetween(
  //           startDayOfMonth,
  //           lastDayOfMonth
  //         );
  //       });

  //       break;

  //     case `Last Month (${showDate.prevMonthStart} - ${showDate.prevMonthEnd})`:
  //       filteredOrders = searchedOrder.filter(
  //         (order) => order.doneStatus && order.finishDate === "-"
  //       );
  //       console.log(filteredOrders);
  //       break;

  //     case "All":
  //       // ALL
  //       // filteredOrders = searchedOrder.filter((order) => {
  //       //   const orderDate = moment(new Date(order.createdAt)).format("lll");

  //       //   return moment(new Date(orderDate)).isBetween(
  //       //     startDayOfPrevWeek,
  //       //     lastDayOfPrevWeek
  //       //   );
  //       // });

  //       break;

  //     default:
  //       filteredOrders = searchedOrder.filter(
  //         (order) =>
  //           moment(new Date(order.createdAt)).format("LL") ===
  //           moment(new Date()).format("LL")
  //       );

  //       break;
  //   }

  //   return filteredOrders;
  // };
  // const newOrders = filterOrders();

  return (
    <Container
      sx={{
        pt: 5,
        pb: 5,
      }}
      maxWidth="lg"
    >
      {report && (
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
                Report
              </Typography>
            </Box>
            {report && (
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent
                  className={`${matches ? "f-col" : "f-space"}`}
                  sx={{ alignItems: "center", py: 3, gap: 3 }}
                >
                  <Box
                    className="f-space"
                    sx={{ flex: 2, gap: 3, width: "100%" }}
                  >
                    {/* <IconButton>
                      <AccountBoxIcon />
                    </IconButton> */}
                    <FormControl variant="standard" sx={{ flex: 1 }}>
                      <InputLabel>Filter</InputLabel>
                      <Select
                        value={filter}
                        label="Category"
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <MenuItem value="Today">
                          <Typography variant="subtitle1" component="p">
                            Today
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
                  <Box sx={{ flex: 2, pt: 0.65 }}></Box>
                </CardContent>
              </Card>
            )}
            {report && (
              <>
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
                      letterSpacing: "1px",
                    }}
                    variant={stacks ? "caption" : "body1"}
                    className="main-title"
                  >
                    Total
                  </Typography>

                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                    component="p"
                  >
                    {formatter.format(total.subtotal)}
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
                      letterSpacing: "1px",
                    }}
                    variant={stacks ? "caption" : "body1"}
                    className="main-title"
                  >
                    Sold Items
                  </Typography>

                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                    component="p"
                  >
                    {total.soldItem} pcs
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
                      letterSpacing: "1px",
                    }}
                    variant={stacks ? "caption" : "body1"}
                    className="main-title"
                  >
                    Products
                  </Typography>

                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                    component="p"
                  >
                    {report.length} Products
                  </Typography>
                </Card>
              </>
            )}
            <Box>
              {report.map((product) => {
                return (
                  <Box
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.85,
                      },
                    }}
                    key={product._id}
                    onClick={() => router.push(`/store/${product._id}`)}
                  >
                    <Card
                      key={product._id}
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
                              noWrap={matches ? true : false}
                              sx={{ width: "100%" }}
                            >
                              {product.name}
                            </Typography>
                            <Box
                              sx={{ display: "flex", alignItems: "flex-end" }}
                            >
                              <Typography component="p" fontWeight={"bold"}>
                                {formatter.format(product.amount)}
                              </Typography>
                              <Typography
                                sx={{
                                  ml: 1,
                                  mb: 0.25,
                                }}
                                variant="caption"
                                component="p"
                              >
                                {product.buyedQty} pcs sold
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
            {/* {order && (
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
                    Order Date
                  </Typography>
                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                  >
                    {moment(new Date(order.createdAt)).format("LLL")}
                  </Typography>
                </Card>

                {order.doneStatus && order.doneStatus !== "-" && (
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
              </>
            )} */}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default DisplayReport;

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
