import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const QuickEdit = ({ user }) => {
  const matches = useMediaQuery("(max-width:720px)");
  const router = useRouter();
  const [products, setProducts] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const min = 1;

  useEffect(async () => {
    try {
      const res = await axios.get("/api/products");
      const { productData } = res.data;
      productData.sort((a, b) => {
        const textA = a.name.toUpperCase();
        const textB = b.name.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });

      setProducts(productData);
      console.log(productData);
    } catch (err) {
      console.log(err.message);
      console.log(err.response.data);
      throw new Error(err.message);
    }
  }, []);

  const handleSave = async () => {
    console.log(products);

    const newProducts = products.map((item) => {
      if (isNaN(item.stockQty)) {
        item.stockQty = 0;
      }
      return item;
    });

    try {
      await axios.post("/api/products/stock", newProducts);
      router.push("/products");
    } catch (err) {
      console.log(err.response.data);
      console.log(err.message);
      throw new Error(err.message);
    }
  };

  let filterProducts;
  if (searchTerm) {
    filterProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm)
    );
    console.log(searchTerm);
  } else {
    filterProducts = products;
  }

  console.log(filterProducts);

  return (
    <Container
      sx={{
        py: 5,
      }}
      maxWidth={matches ? "sm" : "lg"}
    >
      {filterProducts && (
        <Card className="f-row" variant="outlined" size="small">
          <CardContent className="f-col" sx={{ px: 5, width: "100%" }}>
            <Box
              className="f-space"
              sx={{
                mt: 2,
                flex: 1,
                alignItems: "center",
              }}
            >
              <Typography className="main-title" variant="h5" component="h2">
                Quick Edit List
              </Typography>
            </Box>

            <Box
              className="f-space"
              style={{
                border: `${matches ? "none" : "1px solid #ddd"}`,
                borderRadius: ".5vw",
              }}
              sx={{
                px: 2,
                py: 2,
                mt: 3,
                my: 2,
                alignItems: "flex-end",
                gap: 2,
              }}
            >
              <TextField
                label="Product Name"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="standard"
                fullWidth
                autoComplete="off"
              />
            </Box>

            <List sx={{ mb: 3 }}>
              {filterProducts.map((product) => (
                <ListItem
                  key={product._id}
                  sx={{ py: 0, px: 2 }}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: ".5vw",
                    display: "flex",
                    flexDirection: `${matches ? "column" : "row"}`,
                    justifyContent: "space-between",
                    alignItems: `${matches ? "flex-start" : "center"}`,
                    padding: `${matches ? "1rem 1rem" : "0.5rem 1rem"}`,
                  }}
                >
                  <Box
                    sx={{
                      py: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        letterSpacing: `${matches ? "0" : "1px"}`,
                      }}
                    >
                      {product.name}
                    </Typography>
                  </Box>
                  <Box
                    className="f-row"
                    sx={{
                      my: 0.75,
                      borderRadius: "5px",
                      alignSelf: "flex-end",
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
                          matches ? "0.35rem 0.5rem" : "0.7rem 0.75rem"
                        }`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();

                        const newProducts = products.map((item) => {
                          if (item._id === product._id) {
                            product.stockQty =
                              product.stockQty <= 0
                                ? 0
                                : (product.stockQty -= 1);
                          }
                          return item;
                        });
                        setProducts(newProducts);
                      }}
                    >
                      <RemoveIcon fontSize="small" />
                    </span>
                    <TextField
                      inputProps={{
                        min,
                        style: {
                          textAlign: "center",
                          padding: `${matches ? "0.35rem 0" : "0.7rem 0"}`,
                          letterSpacing: "1px",
                        },
                      }}
                      type="number"
                      size="small"
                      value={product.stockQty}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        product.stockQty = value;

                        const newProducts = products.map((item) => {
                          if (item._id === product._id) {
                            product.stockQty = value;
                          }
                          return item;
                        });
                        setProducts(newProducts);
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
                          matches ? "0.35rem 0.5rem" : "0.7rem 0.75rem"
                        }`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(product.stockQty);

                        const newProducts = products.map((item) => {
                          if (item._id === product._id) {
                            product.stockQty = product.stockQty += 1;
                          }
                          return item;
                        });
                        console.log(newProducts);
                        setProducts(newProducts);
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </span>
                  </Box>
                </ListItem>
              ))}
            </List>
            <Box
              sx={{
                alignSelf: "flex-end",
                width: `${matches ? "100%" : "auto"}`,
              }}
              className={matches ? "f-col" : "f-row"}
            >
              <Button
                sx={{
                  alignSelf: "flex-end",
                  width: `${matches ? "100%" : "auto"}`,
                }}
                variant="contained"
                onClick={(e) => {
                  e.target.disabled = true;
                  console.log(e.target.disabled);
                  handleSave();
                }}
              >
                Save
              </Button>
              <Button
                sx={{
                  alignSelf: "flex-end",
                  width: `${matches ? "100%" : "auto"}`,
                }}
                style={{ marginLeft: `${matches ? "0" : ".5rem"}` }}
                variant="outlined"
                onClick={() => router.push("/products")}
              >
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default QuickEdit;

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
