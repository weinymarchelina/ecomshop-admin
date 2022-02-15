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
  Box,
  CardContent,
} from "@mui/material";

const Employee = ({ user }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await axios.post("/api/status/login", {
        email,
        password,
      });
      const { ids } = result.data;

      if (ids) {
        const data = {
          ...ids,
          role: "Employee",
        };

        // console.log(data);
        setCookies("status", data);
        setEmail("");
        setPassword("");

        signIn(null, {
          callbackUrl: `${window.location.origin}/`,
        });
      } else {
        setError("Email or password is incorrect");
        throw new Error("Email or password is incorrect");
      }
    } catch (err) {
      console.log(err);
      // throw new Error(err.response.data.msg);
    }
  };
  return (
    <Container
      className="flex-row"
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
              sx={{ mb: 5 }}
              gutterBottom
              textAlign={"center"}
            >
              {`Join to your business' account`}{" "}
            </Typography>

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth>
                <TextField
                  label="Business' Email"
                  variant="standard"
                  sx={{ mb: 4 }}
                  fullWidth
                  rows={1}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <TextField
                  label="Password"
                  variant="standard"
                  sx={{ mb: 4 }}
                  fullWidth
                  rows={1}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {error && (
                  <Box
                    className="f-space"
                    sx={{
                      pl: 1,
                      pb: 2,
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      component="p"
                      color="error.main"
                    >
                      {error}
                    </Typography>
                  </Box>
                )}

                <Button
                  sx={{ width: "auto", mb: 3 }}
                  type="submit"
                  variant="contained"
                >
                  Join
                </Button>
              </FormControl>
            </form>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Employee;

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
