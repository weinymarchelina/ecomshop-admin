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
  TextField,
  Autocomplete,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Modal,
  Button,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/router";
import ClassIcon from "@mui/icons-material/Class";

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

const styleDecide = (product) => {
  if (!product.activeStatus || product.stockQty === 0) {
    return {
      backgroundColor: "#ddd",
    };
  } else if (product.stockQty < product.warningQty) {
    return {
      backgroundColor: "#FAE496",
    };
  }
};

const textDecide = (product) => {
  if (!product.activeStatus) {
    return "Inactive";
  } else if (product.stockQty === 0) {
    return "Out of Stock";
  } else if (product.stockQty < product.warningQty) {
    return "Low Stock";
  }
};

const Product = ({ user }) => {
  const matches = useMediaQuery("(max-width:720px)");
  const [products, setProducts] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categoryList, setCategoryList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [sortType, setSortType] = useState("Default");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const sortList = [
    "Default",
    "Lowest Price",
    "Highest Price",
    "Lowest Quantity",
    "Highest Quantity",
  ];

  const formatter = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  const qtyFormatter = new Intl.NumberFormat("id", {
    minimumFractionDigits: 0,
  });

  useEffect(async () => {
    try {
      const res = await axios.get("/api/products/");
      const { productData, userStatus, businessCategory } = res.data;
      if (!userStatus) {
        signOut({ callbackUrl: `${window.location.origin}/` });
      }
      setCategoryList(businessCategory);
      setProducts(productData);
    } catch (err) {
      console.log(err.message);
      console.log(err.response?.data);

      throw new Error(err.message);
    }
  }, []);

  const categoryProducts = () => {
    if (selectedCategory === "All") return products;
    else if (selectedCategory !== "All")
      return products.filter(
        (product) => product.category.name === selectedCategory.name
      );
  };

  const filterProducts = () => {
    if (searchTerm) {
      return categoryProducts().filter((product) =>
        product.name.toLowerCase().includes(searchTerm)
      );
    }

    return categoryProducts();
  };

  const filteredProducts = filterProducts();

  const sortProducts = () => {
    let sortedProducts;
    if (filteredProducts) {
      switch (sortType) {
        case "Lowest Price":
          sortedProducts = filteredProducts.sort(
            (a, b) => a.price[0].price - b.price[0].price
          );

          break;

        case "Highest Price":
          sortedProducts = filteredProducts.sort(
            (a, b) => b.price[0].price - a.price[0].price
          );

          break;

        case "Lowest Quantity":
          sortedProducts = filteredProducts.sort(
            (a, b) => a.stockQty - b.stockQty
          );
          break;

        case "Highest Quantity":
          sortedProducts = filteredProducts.sort(
            (a, b) => b.stockQty - a.stockQty
          );

          break;

        default:
          sortedProducts = filteredProducts
            .sort((a, b) => {
              const textA = a.name.toUpperCase();
              const textB = b.name.toUpperCase();
              return textA < textB ? -1 : textA > textB ? 1 : 0;
            })
            .sort(
              (a, b) =>
                (b.stockQty > b.warningQty) - (a.stockQty > a.warningQty)
            )
            .sort((a, b) => (b.stockQty !== 0) - (a.stockQty !== 0))
            .sort((a, b) => b.activeStatus - a.activeStatus);

          break;
      }
    } else {
      sortedProducts = products;
    }

    return sortedProducts;
  };
  const finalProducts = sortProducts();

  const handleDelete = async () => {
    try {
      await axios.post("/api/products/delete", {
        selectedProduct,
      });

      window.location.reload();
    } catch (err) {
      setError(err.response.data.msg);
      return;
    }
  };
  const handleEdit = (product) => {
    router.push(`/products/edit/${product._id}`);
  };

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
                  <Link href={"/products/category"}>
                    <ClassIcon sx={{ fontSize: 32 }} />
                  </Link>
                </IconButton>
                <IconButton color="primary">
                  <Link href={"/products/add"}>
                    <AddBoxIcon sx={{ fontSize: 35 }} />
                  </Link>
                </IconButton>
              </Box>
            </Box>

            {finalProducts && (
              <>
                <Card variant="outlined" sx={{ mt: 2 }}>
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
                          value={selectedCategory}
                          label="Category"
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <MenuItem value="All">
                            <Typography variant="subtitle1" component="p">
                              All
                            </Typography>
                          </MenuItem>
                          {categoryList.map((category) => (
                            <MenuItem key={category.name} value={category}>
                              <Typography variant="subtitle1" component="p">
                                {category.name}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl variant="standard" sx={{ flex: 1 }}>
                        <InputLabel>Sort</InputLabel>
                        <Select
                          value={sortType}
                          label="Sort"
                          onChange={(e) => setSortType(e.target.value)}
                        >
                          {sortList.map((type) => (
                            <MenuItem key={type} value={type}>
                              <Typography variant="subtitle1" component="p">
                                {type}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <TextField
                      onChange={(e) => setSearchTerm(e.target.value)}
                      label="Search"
                      variant="standard"
                      sx={{ flex: 2, pt: 0.65 }}
                      autoComplete="off"
                      fullWidth
                    />
                  </CardContent>
                </Card>
                {open && (
                  <Modal open={open} onClose={() => setOpen(false)}>
                    <Box sx={modalStyle}>
                      {selectedProduct.activeStatus && (
                        <Box className="f-column">
                          <Typography variant="h6" component="p">
                            Please deactivate {selectedProduct.name} before
                            deleting it
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            component="p"
                            sx={{ my: 3 }}
                          >
                            Edit the active status first
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => setOpen(false)}
                          >
                            Close
                          </Button>
                        </Box>
                      )}
                      {!selectedProduct.activeStatus && (
                        <Box className="f-column">
                          <Typography variant="h6" component="p">
                            Are you sure to delete {selectedProduct.name}?
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
                              onClick={handleDelete}
                            >
                              Delete
                            </Button>
                            <Button
                              variant="contained"
                              sx={{ ml: 1 }}
                              onClick={() => setOpen(false)}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Modal>
                )}
                <Grid container spacing={3} sx={{ my: 1 }}>
                  {filteredProducts.map((product) => {
                    return (
                      <Grid item xs={12} sm={6} md={4} key={product._id}>
                        <Card variant="outlined" sx={styleDecide(product)}>
                          <CardContent>
                            <Box sx={{ position: "relative" }}>
                              <Box
                                sx={{
                                  position: "absolute",
                                  right: 0,
                                  mt: 1,
                                  opacity: 1,
                                  zIndex: 1,
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
                                  sx={{
                                    backgroundColor: "#eeeeee90",
                                    mr: 1,
                                  }}
                                  onClick={() => {
                                    setSelectedProduct(product), setOpen(true);
                                  }}
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
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 0,
                                  right: 0,
                                  mb: 1,
                                  opacity: 1,
                                  zIndex: 1,
                                }}
                              >
                                {(!product.activeStatus ||
                                  product.stockQty < product.warningQty) && (
                                  <Typography
                                    variant="overline"
                                    component="p"
                                    fontWeight="bold"
                                    sx={{
                                      p: 1,
                                      py: 0.5,
                                      m: 1,
                                      borderRadius: "0.35vw",
                                      backgroundColor: `${
                                        !product.activeStatus ||
                                        product.stockQty === 0
                                          ? "#eee"
                                          : "#FAE496"
                                      }`,
                                    }}
                                  >
                                    {textDecide(product)}
                                  </Typography>
                                )}
                              </Box>
                              <img
                                src={product.image[0]}
                                alt={`${product.name}-img`}
                                style={{
                                  height: "calc(10rem + 2vw)",
                                  opacity: `${
                                    !product.activeStatus ||
                                    product.stockQty < product.warningQty
                                      ? 0.7
                                      : 1
                                  }`,
                                }}
                              />
                            </Box>
                            <Box sx={{ my: 2, px: 1 }}>
                              <Typography variant="h6" component="h2">
                                {product.name}
                              </Typography>
                              <Typography
                                variant="h6"
                                component="p"
                                fontWeight={"bold"}
                              >
                                {formatter.format(product.price[0].price)}
                              </Typography>
                              <Box
                                className="f-space"
                                sx={{ alignItems: "center" }}
                              >
                                <Typography
                                  sx={{ my: 0.75 }}
                                  variant="body2"
                                  component="p"
                                >
                                  {qtyFormatter.format(product.stockQty)} pcs
                                  left
                                </Typography>
                                <Typography
                                  sx={{ textTransform: "uppercase" }}
                                  variant="caption"
                                  component="p"
                                >
                                  {product.category.name}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </>
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
