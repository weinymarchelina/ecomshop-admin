import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  TextField,
  InputLabel,
  FormLabel,
  IconButton,
  Modal,
  Grid,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const DisplayProduct = ({ user }) => {
  const router = useRouter();
  const { id } = router.query;

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [nextProducts, setNextProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:480px)");
  const min = 1;
  const [max, setMax] = useState(0);
  const [price, setPrice] = useState(0);
  const [cartQty, setCartQty] = useState(0);

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

  useEffect(async () => {
    try {
      const res = await axios.get("/api/products/");

      const { productData } = res.data;
      const searched = productData.filter((product) => product._id === id);
      const mainProduct = searched[0];

      setProduct(mainProduct);
    } catch (err) {
      console.log(err.response.data.msg);
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  }, []);

  return (
    <Container
      sx={{
        py: 5,
      }}
      maxWidth={matches ? "sm" : "lg"}
    >
      <Box className="f-row" variant="outlined" size="small" sx={{ py: 3 }}>
        <Box
          className="f-col"
          sx={{
            width: "100%",
          }}
        >
          <Box
            className="f-col"
            sx={{
              mt: 2,
              mb: 3,
              flex: 1,
              alignItems: "center",
            }}
          >
            <Typography
              variant={matches ? "h5" : "h4"}
              sx={{
                textTransform: "uppercase",
                textAlign: "center",
                fontWeight: `${matches ? 600 : 300}`,
              }}
              component="h2"
            >
              Product Information
            </Typography>
            {product && (
              <>
                <Modal open={open} onClose={() => setOpen(false)}>
                  <Box sx={modalStyle} className="f-column">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        if (1 > imgIndex) {
                          setImgIndex(product.image.length - 1);
                        } else {
                          setImgIndex((val) => val - 1);
                        }
                      }}
                      sx={{
                        position: "absolute",
                        zIndex: 1,
                        top: "50%",
                        left: 0,
                        transform: "translate(0%, -50%)",
                        backgroundColor: "#eeeeee80",
                        "&:hover": {
                          backgroundColor: "#aaaaaa80",
                          opacity: 1,
                        },
                        ml: "calc(1rem + 1vw)",
                      }}
                    >
                      <ArrowBackIosNewIcon />
                    </IconButton>
                    <img
                      onClick={() => {
                        setOpen(true);
                      }}
                      style={{
                        objectFit: "contain",
                        width: "100%",
                        maxHeight: "90vh",
                      }}
                      src={product.image[imgIndex]}
                    />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        if (product.image.length - 1 <= imgIndex) {
                          setImgIndex(0);
                        } else {
                          setImgIndex((val) => val + 1);
                        }
                      }}
                      sx={{
                        position: "absolute",
                        zIndex: 1,
                        backgroundColor: "#eeeeee80",
                        right: 0,
                        top: "50%",
                        transform: "translate(0%, -50%)",
                        "&:hover": {
                          backgroundColor: "#aaaaaa80",
                          opacity: 1,
                        },
                        mr: "calc(1rem + 1vw)",
                      }}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </Box>
                </Modal>
                <Box className="f-col">
                  <Box
                    className={matches ? "f-column" : "f-space"}
                    sx={{
                      gap: 5,
                      my: 5,
                      minHeight: `${matches ? "auto" : "calc(17.5rem + 5vw)"}`,
                      justifyContent: "flex-start",
                    }}
                  >
                    <Box
                      className="f-col"
                      sx={{
                        flex: 2,
                        width: "100%",
                      }}
                    >
                      <Box
                        style={{
                          height: `${matches ? "auto" : "calc(20rem + 5vw)"}`,
                          position: "relative",
                        }}
                      >
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            if (1 > imgIndex) {
                              setImgIndex(product.image.length - 1);
                            } else {
                              setImgIndex((val) => val - 1);
                            }
                          }}
                          sx={{
                            position: "absolute",
                            zIndex: 1,
                            top: "50%",
                            transform: "translate(0%, -50%)",
                            backgroundColor: "#eeeeee80",
                            "&:hover": {
                              backgroundColor: "#aaaaaa80",
                              opacity: 1,
                            },
                            ml: 1,
                          }}
                        >
                          <ArrowBackIosNewIcon />
                        </IconButton>
                        <img
                          onClick={() => {
                            setOpen(true);
                          }}
                          style={{
                            objectFit: "center",
                            width: "100%",
                            height: `${matches ? "50vw" : "100%"}`,
                            cursor: "pointer",
                          }}
                          src={product.image[imgIndex]}
                        />
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.image.length - 1 <= imgIndex) {
                              setImgIndex(0);
                            } else {
                              setImgIndex((val) => val + 1);
                            }
                          }}
                          sx={{
                            position: "absolute",
                            zIndex: 1,
                            backgroundColor: "#eeeeee80",
                            right: 0,
                            top: "50%",
                            transform: "translate(0%, -50%)",
                            "&:hover": {
                              backgroundColor: "#aaaaaa80",
                              opacity: 1,
                            },
                            mr: 1,
                          }}
                        >
                          <ArrowForwardIosIcon />
                        </IconButton>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          width: "100%",
                          gap: 0.5,
                          mt: 1,
                        }}
                      >
                        {product.image.map((img, index) => (
                          <Box
                            key={img}
                            sx={{
                              flex: 1,
                              cursor: "pointer",
                              maxWidth: "calc(2rem + 2.5vw)",
                            }}
                            onClick={() => setImgIndex(index)}
                          >
                            <img
                              style={{
                                opacity: `${index === imgIndex ? 0.7 : 1}`,
                                objectFit: "center",
                                height: `${
                                  matches
                                    ? "calc(2rem + 2.5vw)"
                                    : "calc(2rem + 3vw)"
                                }`,
                              }}
                              src={img}
                              alt={`${product.name} Image`}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ flex: 3, width: "100%" }}>
                      <Box sx={{ flex: 1, mb: 2 }}>
                        <Typography
                          variant={matches ? "h6" : "h5"}
                          component="h2"
                          gutterBottom
                        >
                          {product.name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                          <Typography
                            variant={matches ? "h5" : "h4"}
                            component="p"
                          >
                            {formatter.format(product.price[0].price)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        className="f-col"
                        sx={{
                          width: `${matches ? "100%" : "auto"}`,
                          mx: 0,
                          alignItems: "flex-start",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Box
                          className="f-col"
                          sx={{
                            width: "100%",
                            flex: 1,
                            mx: 0,
                            alignItems: "flex-start",
                            justifyContent: "flex-start",
                          }}
                        >
                          <Box
                            className={matches ? "f-column" : "f-row"}
                            sx={{
                              width: `${matches ? "100%" : "auto"}`,
                              my: 3,
                            }}
                          >
                            <Button
                              variant="contained"
                              sx={{ width: "100%" }}
                              onClick={() =>
                                router.push(`/products/edit/${product._id}`)
                              }
                            >
                              <Typography>Edit Product</Typography>
                            </Button>
                          </Box>
                        </Box>
                      </Box>

                      <Box
                        sx={{ flex: 1, my: 5, pt: 2 }}
                        style={{ borderTop: "1px solid #ddd" }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <FormLabel>
                            <Typography variant="subtitle1">
                              Category
                            </Typography>
                          </FormLabel>
                          <Typography
                            sx={{ my: 1 }}
                            variant="body1"
                            component="p"
                          >
                            {product.category.name}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", mb: 2, gap: 3 }}>
                          <Box>
                            <FormLabel>
                              <Typography variant="subtitle1">
                                Quantity
                              </Typography>
                            </FormLabel>
                            <Typography
                              sx={{ my: 1 }}
                              variant="body1"
                              component="p"
                            >
                              {product.stockQty} pcs
                            </Typography>
                          </Box>

                          <Box>
                            <FormLabel>
                              <Typography variant="subtitle1">
                                Trigger Warning Quantity
                              </Typography>
                            </FormLabel>
                            <Typography
                              sx={{ my: 1 }}
                              variant="body1"
                              component="p"
                            >
                              {product.warningQty} pcs
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <FormLabel>
                            <Typography variant="subtitle1">
                              Price List
                            </Typography>
                          </FormLabel>
                          <Box sx={{ my: 1 }}>
                            {product.price.map((tag) => (
                              <Typography
                                key={tag.minOrder}
                                sx={{ letterSpacing: "1px" }}
                              >
                                {formatter.format(tag.price)} for {tag.minOrder}{" "}
                                pcs
                              </Typography>
                            ))}
                          </Box>
                        </Box>

                        {product.desc && (
                          <Box sx={{ mb: 2 }}>
                            <FormLabel>
                              <Typography variant="subtitle1">
                                Description
                              </Typography>
                            </FormLabel>
                            <Typography
                              sx={{ lineHeight: "135%", my: 1 }}
                              variant="body1"
                              component="p"
                            >
                              {product.desc}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ mb: 2 }}>
                          <FormLabel>
                            <Typography variant="subtitle1">Status</Typography>
                          </FormLabel>
                          <Typography
                            sx={{ my: 1 }}
                            variant="body1"
                            component="p"
                          >
                            {product.activeStatus ? "Active" : "Inactive"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default DisplayProduct;

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
