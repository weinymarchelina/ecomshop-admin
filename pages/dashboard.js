import { Container, Typography, Button } from "@mui/material";
import { getSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import useMediaQuery from "@mui/material/useMediaQuery";

const Dashboard = ({ user }) => {
  const matches = useMediaQuery("(max-width:720px)");

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

  return (
    <Container
      sx={{
        py: 5,
      }}
      maxWidth={matches ? "sm" : "lg"}
    >
      <Typography>Welcome {user.name}</Typography>
    </Container>
  );
};

export default Dashboard;

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
