import { getSession, signOut } from "next-auth/react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  IconButton,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

const Product = ({ user }) => {
  const matches = useMediaQuery("(max-width:720px)");
  const [product, setProduct] = useState(null);

  useEffect(async () => {
    try {
      const res = await axios.get("/api/products/");
      const { productData, userStatus } = res.data;
      if (!userStatus) {
        signOut({ callbackUrl: `${window.location.origin}/` });
      }

      console.log(productData);
      setProduct(productData);
    } catch (err) {
      console.log(err.message);
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
      {product && (
        <Card className="f-row" variant="outlined" size="small" sx={{ p: 3 }}>
          <CardContent
            className={matches ? "f-column" : "f-row"}
            sx={{ px: 5, width: "100%" }}
          >
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
