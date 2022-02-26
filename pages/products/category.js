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
  Input,
  Modal,
  Button,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { getSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import useMediaQuery from "@mui/material/useMediaQuery";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import ErrorWarning from "../../components/ErrorWarning";

const BusinessCategory = ({ user }) => {
  const matches = useMediaQuery("(max-width:720px)");
  const [products, setProducts] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(async () => {
    try {
      const res = await axios.get("/api/products");
      const { businessCategory, userStatus, productData } = res.data;
      if (!userStatus) {
        signOut({ callbackUrl: `${window.location.origin}/` });
      }

      setCategoryList(businessCategory);
      console.log(businessCategory);
      setProducts(productData);
      console.log(productData);
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }, []);

  const addCategory = () => {
    const sameCategory = categoryList.find(
      (category) => newCategory.toLowerCase() === category.name.toLowerCase()
    );
    if (sameCategory) {
      setError("This category already exists");
      return;
    }

    setCategoryList((prevCategory) => [
      ...prevCategory,
      {
        name: newCategory,
        _id: newCategory + Math.random(),
      },
    ]);
    setNewCategory("");
    setError(null);
  };

  const deleteCategory = (selectedCategory) => {
    const categoryUsed = products.filter((product) => {
      return selectedCategory.name === product.category.name;
    });
    if (categoryUsed[0]) {
      return setError(
        "Cannot delete category because the selected category is still being used in the product"
      );
    }

    const newCategoryList = categoryList.filter(
      (eachCategory) => selectedCategory._id !== eachCategory._id
    );

    setCategoryList(newCategoryList);
    setError(null);
  };

  const handleSave = async () => {
    try {
      const nameArr = categoryList
        .map((category) => category.name)
        .sort((a, b) => {
          const textA = a.toUpperCase();
          const textB = b.toUpperCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        });
      const res = await axios.post("/api/products/category", nameArr);

      console.log(res);
      router.push("/products");
    } catch (err) {
      console.log(err.message);
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  };

  return (
    <Container
      sx={{
        py: 5,
      }}
      maxWidth={matches ? "sm" : "lg"}
    >
      {categoryList && (
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
                Category List
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
                label="New Category"
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                variant="standard"
                fullWidth
                autoComplete="off"
              />
              <Button onClick={addCategory} variant="contained" size="small">
                Add
              </Button>
            </Box>
            {error && (
              <Box
                style={{ border: "1px solid firebrick", borderRadius: "0.5vw" }}
                sx={{ pb: 2, px: 2 }}
              >
                <ErrorWarning error={error} />
              </Box>
            )}
            <List>
              {categoryList.map((category) => (
                <ListItem
                  key={category._id}
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
                    {category.name}
                  </Typography>
                  <ListItemButton
                    sx={{ px: 1, flex: 1 }}
                    onClick={() => deleteCategory(category)}
                  >
                    <RemoveCircleIcon color="primary" />
                  </ListItemButton>
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
                onClick={handleSave}
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

export default BusinessCategory;

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
