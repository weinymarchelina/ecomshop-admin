import { getSession, signOut } from "next-auth/react";
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
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import InputAdornment from "@mui/material/InputAdornment";
import ErrorWarning from "../../components/ErrorWarning";
import useMediaQuery from "@mui/material/useMediaQuery";

const AddProduct = ({ user }) => {
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
  const [image, setImage] = useState();
  const [uploadData, setUploadData] = useState("");
  const [files, setFiles] = useState(null);
  const [categoryList, setCategoryList] = useState(["Casing", "Headset"]);
  const [error, setError] = useState(null);

  const formatter = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  useEffect(async () => {
    try {
      const res = await axios.get("/api/data/check");
      const { userStatus } = res.data;
      if (!userStatus) {
        signOut({ callbackUrl: `${window.location.origin}/` });
      }
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }, []);

  const uploadImage = async (fileInput) => {
    const formData = new FormData();

    for (const file of fileInput.files) {
      formData.append("file", file);
    }

    formData.append("upload_preset", "superoneaccdebest");

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/superoneacc/image/upload",
      formData
    );

    setImage(res.data.secure_url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const fileInput = Array.from(form.elements).find(
      ({ name }) => name === "file"
    );
    await uploadImage(fileInput);

    const product = {
      name,
      category,
      desc,
      image,
      stockQty,
      warningQty,
      activeStatus: active,
      price: priceList,
    };
    console.log(product);
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
      setError("Please input numbers");
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

  const handleChange = (event) => {
    const reader = new FileReader();

    reader.onload = function (onLoadEvent) {
      setImage(onLoadEvent.target.result);
      setUploadData(undefined);
    };

    reader.readAsDataURL(event.target.files[0]);
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
              Add Product
            </Typography>
          </Box>
          <form autoComplete="off" onSubmit={handleSubmit}>
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
                      <MenuItem value={item} key={item}>
                        {item}
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
              className={matches ? "f-col" : "f-space"}
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
              <Box>
                <InputLabel>Image</InputLabel>
                <Button
                  component="label"
                  variant="contained"
                  sx={{ mt: 2 }}
                  size="small"
                >
                  Upload Image
                  <Input
                    accept="image/*"
                    type="file"
                    name="file"
                    sx={{ display: "none" }}
                    onChange={(e) => handleChange(e)}
                    hidden
                  />
                </Button>
              </Box>

              <Box
                sx={{
                  width: `${matches ? "100%" : "45%"}`,
                  // height: `${
                  //   matches ? "calc(7.5rem + 25vw)" : "calc(10rem + 5vw)"
                  // }`,
                  backgroundColor: "#eee",
                  my: `${matches ? "2rem" : "none"}`,
                  border: "3px dashed #ddd",
                  borderRadius: "1vw",
                }}
              >
                {image && <img src={image} alt="Image" />}
              </Box>
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
                onChange={(e) => setStockQty(e.target.value)}
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
                onChange={(e) => setWarningQty(e.target.value)}
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
                        {formatter.format(list.price)} for {list.minOrder} pcs
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
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AddProduct;

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
