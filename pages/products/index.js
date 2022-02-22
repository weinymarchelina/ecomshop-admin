import { getSession, signOut } from "next-auth/react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  IconButton,
  Grid,
  Paper,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const bgColorDecide = (product) => {
  if (!product.activeStatus) {
    return "#ccc";
  } else if (product.stockQty < product.warningQty) {
    return "gold";
  } else if (product.stockQty === 0) {
    return "firebrick";
  }
};

const Product = ({ user }) => {
  const matches = useMediaQuery("(max-width:720px)");
  const [products, setProducts] = useState(null);

  const formatter = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  useEffect(async () => {
    try {
      const res = await axios.get("/api/products/");
      const { productData, userStatus } = res.data;
      if (!userStatus) {
        signOut({ callbackUrl: `${window.location.origin}/` });
      }

      console.log(productData);
      setProducts(productData);
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }, []);

  const handleDelete = (product) => {};

  return (
    <Container
      sx={{
        py: 5,
      }}
      maxWidth={matches ? "sm" : "lg"}
    >
      {products && (
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
                Product List
              </Typography>
              <Box>
                <IconButton color="primary">
                  <Link href={"/products/add"}>
                    <AddBoxIcon sx={{ fontSize: 35 }} />
                  </Link>
                </IconButton>
              </Box>
            </Box>

            {products && (
              <Grid container spacing={3} sx={{ my: 1 }}>
                {products.map((product) => {
                  return (
                    <Grid item xs={12} sm={6} md={4} key={product._id}>
                      <Card
                        variant="outlined"
                        sx={{
                          backgroundColor: bgColorDecide(product),
                        }}
                      >
                        <CardContent>
                          <Box sx={{ position: "relative" }}>
                            <Box
                              sx={{
                                position: "absolute",
                                right: 0,
                                mt: 1,

                                letterSpacing: "1.5px",
                              }}
                            >
                              <IconButton
                                size="small"
                                sx={{ backgroundColor: "#eeeeee90", mr: 1 }}
                                onClick={() => handleEdit(product)}
                              >
                                <EditIcon
                                  sx={{
                                    color: "black",
                                    "&:hover": {
                                      color: "#fff",
                                    },
                                  }}
                                  fontSize="small"
                                />
                              </IconButton>
                              <IconButton
                                size="small"
                                sx={{ backgroundColor: "#eeeeee90", mr: 1 }}
                                onClick={() => handleDelete(product)}
                              >
                                <DeleteIcon
                                  sx={{
                                    color: "black",
                                    "&:hover": {
                                      color: "#fff",
                                    },
                                  }}
                                  fontSize="small"
                                />
                              </IconButton>
                            </Box>
                            <img
                              src={product.image[0]}
                              alt={`${product.name}-img`}
                              style={{ height: "calc(10rem + 2vw)" }}
                            />
                          </Box>
                          <Box sx={{ my: 2, px: 1 }}>
                            <Typography variant="h6" component="h2">
                              {product.name}
                            </Typography>
                            <Typography
                              sx={{ mb: 1 }}
                              variant="h6"
                              component="p"
                              fontWeight={"bold"}
                            >
                              {formatter.format(product.price[0].price)}
                            </Typography>
                            <Typography
                              sx={{ my: 0.5 }}
                              variant="body2"
                              component="p"
                            >
                              {product.stockQty} pcs left
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Product;

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
