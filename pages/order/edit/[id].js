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
  Input,
  Select,
  MenuItem,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

// const idLocale = require("moment/locale/id");
// moment.locale("id", idLocale);
const formatter = new Intl.NumberFormat("id", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const EditOrder = ({ user }) => {
  const router = useRouter();
  const { id } = router.query;
  const min = 1;
  const max = 0;
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [subtotal, setSubtotal] = useState(formatter.format(0));
  const [totalOrder, setTotalOrder] = useState(0);
  const switchNav = useMediaQuery("(max-width:900px)");
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:560px)");

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

        // console.log(orderData);
        console.log(productObj);
        return productObj;
      });
      setProducts(orderedProductList);
      setOrder(orderData);
      setSubtotal(formatter.format(orderData.totalPrice));
      setTotalOrder(orderData.totalQty);
    } catch (err) {
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  }, [id]);

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

  const deleteItem = (e, selectedProduct) => {
    e.stopPropagation();
    const newProducts = products.filter(
      (product) => selectedProduct._id !== product._id
    );

    setProducts(newProducts);
  };

  const getPrice = (currentQty, selectedProduct) => {
    if (selectedProduct.price.length === 1 || currentQty === "") {
      return selectedProduct.price[0].price;
    }

    const rules = selectedProduct.price.reduce((a, b) => {
      return Math.abs(b.minOrder - currentQty) <
        Math.abs(a.minOrder - currentQty)
        ? b
        : a;
    });

    const priceCheck = selectedProduct.price
      .map((path, i, arr) => {
        if (path.minOrder === rules.minOrder) {
          if (rules.minOrder <= currentQty) {
            return path;
          } else {
            const prevPath = i - 1;
            return arr[prevPath];
          }
        }
      })
      .find((obj) => obj);

    return priceCheck.price;
  };

  const getSelectedTotal = (arr = products) => {
    const subtotal = arr.map((item) => item.orderedPrice * item.orderedQty);
    const result = subtotal.reduce((partialSum, a) => partialSum + a, 0);
    setSubtotal(formatter.format(result));
    return result;
  };

  const getSelectedQty = (arr = products) => {
    const totalQty = arr.map((item) => {
      console.log(item.orderedQty ? item.orderedQty : 0);
      return item.orderedQty ? item.orderedQty : 0;
    });
    console.log(totalQty);
    const result = totalQty.reduce((partialSum, a) => partialSum + a, 0);
    setTotalOrder(result);
  };

  const handleSave = async () => {
    const newItemList = products.map((product) => {
      return {
        productId: product._id,
        quantity: product.orderedQty,
        price: product.orderedPrice,
      };
    });

    const orderOriItem = order.itemList;
    const newProducts = products.map((productData) => {
      const theOrderedQty = orderOriItem.find(
        (item) => item.productId === productData._id
      );

      const currentStock =
        productData.stockQty + theOrderedQty.quantity - productData.orderedQty;

      console.log(`
        Product name: ${productData.name}
        Original Stock: ${productData.stockQty + theOrderedQty.quantity}
        Purchased: ${productData.orderedQty}
        Current Stock: ${currentStock}
        `);

      productData.stockQty = currentStock;

      console.log(productData);
      return productData;
    });
    console.log(newProducts);

    try {
      const res = await axios.post("/api/order/edit", {
        totalPrice: getSelectedTotal(products),
        totalQty: totalOrder,
        itemList: newItemList,
        orderId: order._id,
        orderOriItem: order.itemList,
        products: newProducts,
      });

      console.log(res.data);
      router("/order");
    } catch (err) {
      console.log(err.message);
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
                Edit Order
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
                    backgroundColor: getColor(order),
                  }}
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
                    onClick={() => router.push(`/store/${product._id}`)}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        backgroundColor: `${
                          product.stockQty === 0 ? "#eee" : "transparent"
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
                              {getPrice(product.orderedQty, product) !==
                                product.price[0].price && (
                                <Typography
                                  sx={{
                                    ml: 1,
                                    textDecoration: "line-through",
                                  }}
                                  variant="caption"
                                  component="p"
                                >
                                  {formatter.format(product.price[0].price)}
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="caption" component="p">
                              Total:{" "}
                              {formatter.format(
                                product.orderedPrice * product.orderedQty
                              )}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          className={switchNav ? "" : "f-col"}
                          sx={{
                            display: "flex",
                            justifyContent: `${
                              switchNav ? "flex-end" : "space-between"
                            }`,
                            alignItems: "flex-end",
                          }}
                        >
                          <Box>
                            <Box
                              sx={{
                                opacity: 1,
                                zIndex: 1,
                              }}
                            >
                              <IconButton
                                sx={{
                                  mr: 1,
                                }}
                                onClick={(e) => {
                                  deleteItem(e, product);
                                }}
                              >
                                <DeleteIcon color="#ccc" fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              className="f-row"
                              sx={{
                                flex: 1,
                                mx: 0,
                                borderRadius: "5px",
                              }}
                              style={{
                                border: "1px solid #ddd",
                                flex: `${matches ? 1 : "none"}`,
                              }}
                            >
                              <span
                                className="buttonAdd f-row"
                                style={{
                                  padding: `${
                                    stacks ? "0.1rem 0.5rem" : "0.25rem 1rem"
                                  }`,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  const updatedProducts = products.map(
                                    (item) => {
                                      if (item._id === product._id) {
                                        const currentQty =
                                          product.orderedQty === 1
                                            ? 1
                                            : product.orderedQty - 1;

                                        item.orderedQty = currentQty;
                                        item.orderedPrice = getPrice(
                                          currentQty,
                                          product
                                        );
                                      }
                                      return item;
                                    }
                                  );
                                  setProducts(updatedProducts);
                                  getSelectedTotal(updatedProducts);
                                  getSelectedQty(updatedProducts);
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </span>
                              <TextField
                                inputProps={{
                                  min,
                                  max,
                                  style: {
                                    textAlign: "center",
                                    padding: `${
                                      stacks ? "0.25rem 0" : "0.5rem 0"
                                    }`,
                                    letterSpacing: "1px",
                                  },
                                }}
                                type="number"
                                size="small"
                                value={product.orderedQty}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  let value = parseInt(e.target.value, 10);
                                  const theOrderedQty = order.itemList.find(
                                    (item) => item.productId === product._id
                                  );

                                  // const max =
                                  //   product.stockQty < theOrderedQty.quantity
                                  //     ? theOrderedQty.quantity
                                  //     : product.stockQty;
                                  const max =
                                    product.stockQty + theOrderedQty.quantity;

                                  if (value > max) value = max;
                                  if (value < min) value = min;

                                  if (!value) value = "";

                                  const updatedProducts = products.map(
                                    (item) => {
                                      if (item._id === product._id) {
                                        const currentQty = value;

                                        item.orderedQty = currentQty;
                                        item.orderedPrice =
                                          value >= 1
                                            ? getPrice(currentQty, product)
                                            : product.price[0].price;
                                      }
                                      return item;
                                    }
                                  );
                                  setProducts(updatedProducts);
                                  getSelectedTotal(updatedProducts);
                                  getSelectedQty(updatedProducts);
                                }}
                                required
                                sx={{
                                  mx: 0,
                                  p: 0,
                                  width: "3.75rem",
                                }}
                              />
                              <span
                                className="buttonAdd  f-row"
                                style={{
                                  padding: `${
                                    stacks ? "0.1rem 0.5rem" : "0.25rem 1rem"
                                  }`,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  const theOrderedQty = order.itemList.find(
                                    (item) => item.productId === product._id
                                  );

                                  // const max =
                                  //   product.stockQty < theOrderedQty.quantity
                                  //     ? theOrderedQty.quantity
                                  //     : product.stockQty;

                                  const max =
                                    product.stockQty + theOrderedQty.quantity;

                                  const updatedProducts = products.map(
                                    (item) => {
                                      if (item._id === product._id) {
                                        const currentQty =
                                          Number(product.orderedQty) + 1 > max
                                            ? product.orderedQty
                                            : Number(product.orderedQty) + 1;

                                        item.orderedQty = currentQty;
                                        item.orderedPrice = getPrice(
                                          currentQty,
                                          product
                                        );
                                      }
                                      return item;
                                    }
                                  );
                                  setProducts(updatedProducts);
                                  getSelectedTotal(updatedProducts);
                                  getSelectedQty(updatedProducts);
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </span>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
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
                    Total Order {`(${totalOrder} Items)`}
                  </Typography>
                  <Typography
                    sx={{ textAlign: "right" }}
                    variant={stacks ? "caption" : "body1"}
                  >
                    {subtotal}
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
                  <Button
                    size="small"
                    onClick={() => router.push("/order")}
                    variant="outlined"
                  >
                    Back
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleSave()}
                  >
                    Save
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default EditOrder;

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
