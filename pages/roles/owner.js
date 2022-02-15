import React, { useState } from "react";
import axios from "axios";
import { getSession, signIn } from "next-auth/react";
import { setCookies } from "cookies-next";
import {
  Typography,
  Container,
  FormControl,
  TextField,
  Button,
  Card,
  CardContent,
} from "@mui/material";

const Owner = ({ user }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await axios.post("/api/status/register", {
      name,
      phone,
      email,
      password,
    });
    const { businessForm } = result.data;

    if (businessForm) {
      const data = {
        ...businessForm,
        role: "Owner",
      };

      setCookies("status", data);

      setName("");
      setPhone("");
      setEmail("");
      setPassword("");

      signIn(null, {
        callbackUrl: `${window.location.origin}/`,
      });
    } else {
      throw new Error("This email has already been taken");
    }
  };
  return (
    <Container
      sx={{
        py: 5,
      }}
      maxWidth={"sm"}
    >
      {!user && (
        <Card className="f-column" variant="outlined">
          <CardContent sx={{ px: 4, py: 6 }}>
            <Typography
              className="main-title"
              variant="h4"
              component="h1"
              sx={{ mb: 3 }}
              gutterBottom
            >
              Business Form
            </Typography>
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth>
                <TextField
                  label="Business's Name"
                  variant="standard"
                  sx={{ mb: 4 }}
                  fullWidth
                  rows={1}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <TextField
                  label="Phone Number"
                  fullWidth
                  rows={1}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={{ mb: 4 }}
                  variant="standard"
                  required
                />

                <TextField
                  label="Email"
                  fullWidth
                  rows={1}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 4 }}
                  variant="standard"
                  required
                />

                <TextField
                  label="Password"
                  fullWidth
                  rows={1}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 4 }}
                  variant="standard"
                  required
                />

                <Button
                  sx={{ width: "auto", p: 1, mb: 3 }}
                  type="submit"
                  variant="contained"
                >
                  Create
                </Button>
              </FormControl>
            </form>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Owner;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { user: null },
  };
}
