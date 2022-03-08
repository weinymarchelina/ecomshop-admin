import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Input,
  FormLabel,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  Grid,
  IconButton,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import InputAdornment from "@mui/material/InputAdornment";
import ErrorWarning from "../../../components/ErrorWarning";
import LoadingModal from "../../../components/LoadingModal";

const EditProduct = ({ user }) => {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState([]);

  const stacks = useMediaQuery("(max-width:450px)");
  const matches = useMediaQuery("(max-width:720px)");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [warningQty, setWarningQty] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [priceList, setPriceList] = useState([]);
  const [active, setActive] = useState(true);
  const [imgPath, setImgPath] = useState([]);
  const [oldImgPath, setOldImgPath] = useState([]);
  const [uploadData, setUploadData] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [imgError, setImgError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [switchStatus, setSwitchStatus] = useState(false);

  useEffect(async () => {
    try {
      const res = await axios.post("/api/data/products", {
        productId: id,
      });

      const { userStatus, product: productData, allCategory } = res.data;
      if (!userStatus) {
        signOut({ callbackUrl: `${window.location.origin}/` });
      }

      const res2 = await axios.post("/api/products/isUsedCheck", {
        productId: id,
      });
      const { isUsed } = res2.data;
      console.log(isUsed);

      console.log(productData);
      setProduct(productData);
      setActive(productData.activeStatus);
      setDesc(productData.desc);
      setName(productData.name);
      setPriceList(productData.price);
      setStockQty(productData.stockQty);
      setWarningQty(productData.warningQty);
      setCategoryList(allCategory);
      setSwitchStatus(isUsed);

      const theCategory = allCategory.find(
        (category) => category.name === productData.category.name
      );
      setCategory(theCategory);

      const oldImgPaths = productData.image.map((link) => {
        return {
          path: link,
          uid: `${link.substr(link.length - 25)}${Math.random()}`,
          file: null,
        };
      });
      setImgPath(oldImgPaths);
      setOldImgPath(productData.image);
    } catch (err) {
      console.log(err.response.data.msg);
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  }, []);

  const formatter = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
  const qtyFormatter = new Intl.NumberFormat("id", {
    minimumFractionDigits: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imgPath.length === 0) {
      setImgError("Please upload an image");
      return;
    }

    const mainPrice = priceList.filter((tag) => tag.minOrder === 1);
    if (mainPrice.length !== 1) {
      setError("Please input the base price for one quantity of this product");
      setMinOrder(1);
      return;
    }

    setLoading(true);

    console.log(imgPath);

    const imgLinks = imgPath.map(async (imgObj) => {
      if (!imgObj.file) {
        return imgObj.path;
      }

      const formData = new FormData();
      formData.append("file", imgObj.file);
      formData.append("upload_preset", "superoneaccdebest");

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_API_CLOUD_NAME}/image/upload`,
        formData
      );

      console.log("Howdy 3");

      return await res.data.secure_url;
    });

    axios.all(imgLinks).then(async (image) => {
      const deletedLinks = oldImgPath.filter((link) => {
        if (!image.includes(link)) {
          return link;
        }
      });

      const product = {
        name,
        category,
        desc,
        image,
        stockQty: Number(stockQty),
        warningQty: Number(warningQty),
        activeStatus: active,
        price: priceList,
        businessId: user.businessId,
        id,
        deletedLinks,
      };

      console.log(product);

      try {
        const res = await axios.post("/api/products/edit", product);
        console.log(res);
        setActive(true);
        setCategory("");
        setDesc("");
        setImgPath("");
        setName("");
        setPrice("");
        setPriceList([]);
        setStockQty("");
        setWarningQty("");

        setLoading(false);

        router.push("/products");
      } catch (err) {
        console.log(err.response?.data);
        throw new Error(err.message);
      }
    });
  };

  const addPrice = () => {
    const sameQty = priceList.filter((tag) => {
      return tag.minOrder === Number(minOrder);
    });

    console.log(sameQty);

    if (sameQty.length > 0) {
      setError("Please input different order quantity");
      return;
    } else if (!parseFloat(price) || !parseFloat(minOrder)) {
      setError("Please input valid numbers");
      return;
    } else {
      priceList.push({
        price: Math.abs(price),
        minOrder: Math.abs(minOrder),
      });
      priceList.sort((a, b) => a.minOrder - b.minOrder);
      setPrice("");
      setMinOrder("");
      setError(null);
    }
  };

  const handleDelete = (selectedImg) => {
    const newImgList = imgPath.filter(
      (eachPath) => eachPath.uid !== selectedImg.uid
    );
    setImgPath(newImgList);

    if (imgPath.length <= 7) {
      setImgError(null);
    }
  };

  const handleChange = (event) => {
    console.log(event.target.files);

    const counter = imgPath.length;

    for (const file of event.target.files) {
      console.log(file);
      counter++;
      if (counter > 6) {
        setImgError("You can only upload maximum 6 images");
        return;
      }

      const reader = new FileReader();

      reader.onload = function (onLoadEvent) {
        setImgPath((prevPaths) => [
          ...prevPaths,
          {
            path: onLoadEvent.target.result,
            file,
            uid: `${file.lastModified}${Math.random()}${file.size}`,
          },
        ]);
        setUploadData(undefined);
      };

      reader.readAsDataURL(file);
    }

    setImgError(null);
  };

  return (
    <Container
      sx={{
        py: 5,
      }}
      maxWidth={matches ? "sm" : "lg"}
    >
      <Card className="f-row" variant="outlined" size="small" sx={{ p: 3 }}>
        <CardContent
          className="f-col"
          sx={{
            px: "calc(1rem + 2.5vw)",
            width: "100%",
          }}
        >
          <Box
            className="f-space"
            sx={{
              mt: 2,
              mb: 3,
              flex: 1,
              alignItems: "center",
            }}
          >
            <Typography className="main-title" variant="h5" component="h2">
              Edit Product
            </Typography>
          </Box>
          <LoadingModal loading={loading} />
          <form autoComplete="off" className="f-col" onSubmit={handleSubmit}>
            <Box
              className={matches ? "f-col" : "f-space"}
              sx={{
                p: `${matches ? "none" : "1rem"}`,
                mb: `${matches ? "none" : "2rem"}`,
              }}
              style={{
                border: `${matches ? "none" : "1px solid #ddd"}`,
                borderRadius: ".5vw",
              }}
            >
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mr: `${matches ? "0" : "1rem"}`, my: 2 }}
                variant="standard"
                required
                fullWidth
              />

              <FormControl
                variant="standard"
                sx={{ ml: `${matches ? "0" : "1rem"}`, my: 2 }}
                required
                fullWidth
              >
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categoryList.map((item) => {
                    return (
                      <MenuItem value={item} key={item._id}>
                        {item.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                p: `${matches ? "none" : "1rem"}`,
                my: 2,
              }}
              style={{
                border: `${matches ? "none" : "1px solid #ddd"}`,
                borderRadius: ".5vw",
              }}
            >
              <TextField
                label="Description"
                multiline
                fullWidth
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className={matches ? "f-col" : "f-space"}
                sx={{ my: 2 }}
                variant="standard"
                rows={3}
              />
            </Box>

            <Box
              className="f-col"
              sx={{
                px: `${matches ? "none" : "1rem"}`,
                py: `${matches ? "none" : "1.5rem"}`,
                mb: 2,
                mt: 3,
              }}
              style={{
                border: `${matches ? "none" : "1px solid #ddd"}`,
                borderRadius: ".5vw",
              }}
            >
              <Box sx={{ mr: 5 }}>
                <InputLabel>Image</InputLabel>
                <Button
                  component="label"
                  variant="contained"
                  sx={{ my: 2 }}
                  size="small"
                >
                  Upload Image
                  <input
                    accept="image/*"
                    multiple
                    type="file"
                    name="file"
                    style={{ display: "none" }}
                    onChange={(e) => handleChange(e)}
                    hidden
                  />
                </Button>
              </Box>

              {imgError && (
                <Box
                  sx={{ px: 2, pb: 2 }}
                  style={{
                    border: "1px solid #e57373",
                    borderRadius: ".5vw",
                    marginTop: `${matches ? "1rem" : "0"}`,
                  }}
                >
                  <ErrorWarning error={imgError} />
                </Box>
              )}

              {imgPath.length > 0 && (
                <Grid
                  container
                  sx={{
                    width: "100%",
                    mt: 3,
                    py: 0,
                  }}
                  spacing={1}
                >
                  {imgPath.map((pathItem, index) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={pathItem.uid}
                      sx={{ position: "relative" }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          py: 0.9,
                          px: 0.65,
                          m: 1,
                          backgroundColor: "#eeeeee90",
                          borderRadius: "50%",
                          fontWeight: "bold",
                          fontSize: "0.55rem",
                          letterSpacing: "1.5px",
                        }}
                      >
                        {index + 1}/{imgPath.length}
                      </Box>
                      <IconButton
                        onClick={() => handleDelete(pathItem)}
                        sx={{
                          position: "absolute",
                          right: 0,
                          mt: 0.25,
                          letterSpacing: "1.5px",
                        }}
                      >
                        <DeleteIcon color="primary" />
                      </IconButton>
                      <img
                        src={pathItem.path}
                        alt="Image"
                        style={{ height: "100%" }}
                      />
                    </Grid>
                  ))}
                  {uploadData && (
                    <code>
                      <pre>{JSON.stringify(uploadData, null, 2)}</pre>
                    </code>
                  )}
                </Grid>
              )}
            </Box>

            <Box
              className={matches ? "f-col" : "f-space"}
              sx={{
                alignItems: "flex-start",
                p: `${matches ? "none" : "1rem"}`,
                my: 2,
              }}
              style={{
                border: `${matches ? "none" : "1px solid #ddd"}`,
                borderRadius: ".5vw",
              }}
            >
              <TextField
                label="Stock Quantity"
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value.toString())}
                variant="standard"
                required
                sx={{
                  my: 2,
                  width: `${matches ? "100%" : "35%"}`,
                }}
              />

              <TextField
                label="Stock Warning Quantity"
                type="number"
                value={warningQty}
                onChange={(e) => setWarningQty(e.target.value.toString())}
                variant="standard"
                required
                sx={{
                  my: 2,
                  width: `${matches ? "100%" : "35%"}`,
                }}
              />

              <FormControl sx={{ my: 2 }} className="f-column">
                <FormLabel>Active Status</FormLabel>
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      disabled={switchStatus}
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </FormControl>
            </Box>

            <Box
              className={matches ? "f-col" : "f-space"}
              style={{
                border: `${matches ? "none" : "1px solid #ddd"}`,
                borderRadius: ".5vw",
              }}
              sx={{ padding: `${matches ? "none" : "1rem"}` }}
            >
              <FormControl
                variant="standard"
                sx={{ width: `${matches ? "100%" : "35%"}`, my: 2 }}
              >
                <InputLabel>Price</InputLabel>
                <Input
                  variant="outlined"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">Rp</InputAdornment>
                  }
                />
              </FormControl>
              <TextField
                label="Minimum Order"
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                variant="standard"
                sx={{ width: `${matches ? "100%" : "35%"}`, my: 2 }}
              />
              <Box
                sx={{
                  display: "flex",
                  alignSelf: `${matches ? "flex-end" : "center"}`,
                  justifyContent: `${matches ? "flex-end" : "flex-start"}`,
                  width: `${stacks ? "100%" : "auto"}`,
                }}
              >
                <Button
                  onClick={addPrice}
                  variant="outlined"
                  size="small"
                  sx={{ width: `${stacks ? "100%" : "auto"}`, mt: 2 }}
                >
                  Add Price
                </Button>
              </Box>
            </Box>
            {error && (
              <Box
                sx={{ px: 2, pb: 2 }}
                style={{
                  border: "1px solid #e57373",
                  borderRadius: ".5vw",
                  marginTop: `${matches ? "1rem" : "0"}`,
                }}
              >
                <ErrorWarning error={error} />
              </Box>
            )}

            {priceList.length > 0 && (
              <List
                sx={{ mt: 5, pb: 0 }}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: ".5vw",
                }}
              >
                <Typography
                  sx={{ px: 2, pt: 1, pb: 2 }}
                  variant="h7"
                  component="p"
                >
                  Price List
                </Typography>
                {priceList.map((list) => {
                  return (
                    <ListItem
                      key={list.minOrder}
                      sx={{ py: 0, px: 2 }}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: ".5vw",
                        display: "flex",
                      }}
                    >
                      <Typography
                        sx={{
                          flex: 19,
                          letterSpacing: `${matches ? "0" : "1px"}`,
                        }}
                      >
                        {formatter.format(list.price)} for{" "}
                        {qtyFormatter.format(list.minOrder)} pcs
                      </Typography>
                      <ListItemButton
                        sx={{ px: 1, flex: 1 }}
                        onClick={() => {
                          const newPriceList = priceList.filter(
                            (tag) => tag.minOrder !== list.minOrder
                          );

                          setPriceList(newPriceList);
                          setError(null);
                        }}
                      >
                        <RemoveCircleIcon color="primary" />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
            <Button
              sx={{
                px: 3,
                py: 1,
                mt: 5,
                alignSelf: `${stacks ? "center" : "flex-end"}`,
                width: `${stacks ? "100%" : "auto"}`,
              }}
              size="large"
              type="submit"
              variant="contained"
            >
              Edit
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EditProduct;

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
