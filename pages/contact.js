import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import useMediaQuery from "@mui/material/useMediaQuery";
import EditIcon from "@mui/icons-material/Edit";

const Contact = () => {
  const matches = useMediaQuery("(max-width:720px)");
  const router = useRouter();
  const [userList, setUserList] = useState();
  const [selectedUser, setSelectedUser] = useState({});
  const [selectedName, setSelectedName] = useState("");

  useEffect(async () => {
    try {
      const res = await axios.get("/api/data/users");
      const { users } = res.data;
      const usersData = users.sort((a, b) => {
        const textA = a.name.toUpperCase();
        const textB = b.name.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });

      setUserList(usersData);
    } catch (err) {
      console.log(err.message);
      console.log(err.response.data);
      throw new Error(err.message);
    }
  }, []);

  const handleRename = () => {
    const newList = userList.map((user) => {
      const findUser = user._id === selectedUser._id;
      if (findUser) {
        // user.contactInfo?.name = selectedName;

        const newUser = {
          ...user,
          contactInfo: {
            name: selectedName,
          },
        };
        // console.log(newUser);
        return newUser;
      }

      return user;
    });

    setUserList(newList);
    setSelectedName("");
    setSelectedUser({});
  };

  const handleSave = async () => {
    try {
      await axios.post("/api/data/contact", userList);
      router.push("/order");
    } catch (err) {
      console.log(err.response.data);
      console.log(err.message);
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
      {userList && (
        <Box className="f-row" variant="outlined" size="small">
          <Box className="f-col" sx={{ px: 5, width: "100%" }}>
            <Box
              className="f-space"
              sx={{
                my: 2,
                flex: 1,
                alignItems: "center",
              }}
            >
              <Typography
                className="main-title"
                variant={matches ? "h5" : "h4"}
                component="h2"
              >
                Contact List
              </Typography>
            </Box>

            <Box
              className="f-space"
              style={{
                border: "1px solid #ddd",
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
                label="Custom Name"
                placeholder={
                  selectedUser.name
                    ? `Custom name for ${selectedUser.name}`
                    : ""
                }
                type="text"
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                variant="standard"
                fullWidth
                autoComplete="off"
                required
                size={matches ? "small" : "medium"}
              />
              <Button
                disabled={selectedUser?._id ? false : true}
                onClick={handleRename}
                variant="contained"
                size="small"
              >
                Rename
              </Button>
            </Box>

            <List sx={{ mb: 3 }}>
              {userList.map((user) => (
                <ListItem
                  key={user._id}
                  sx={{ py: 0, px: 2 }}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: ".5vw",
                    display: "flex",
                  }}
                >
                  <Box
                    sx={{
                      flex: 19,
                      py: 1,
                    }}
                    className="f-col"
                  >
                    <Typography
                      sx={{
                        letterSpacing: `${matches ? "0" : "1px"}`,
                        fontSize: `${user.contactInfo?.name ? "10px" : "16px"}`,
                      }}
                      variant={user.contactInfo?.name ? "caption" : "body1"}
                    >
                      {user.name}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.25,
                        letterSpacing: `${matches ? "0" : "1px"}`,
                      }}
                    >
                      {user.contactInfo?.name}
                    </Typography>
                  </Box>
                  <ListItemButton
                    sx={{ px: 1, flex: 1 }}
                    onClick={() => {
                      setSelectedName("");
                      setSelectedUser(user);

                      if (user.contactInfo.name) {
                        setSelectedName(user.contactInfo.name);
                      }
                    }}
                  >
                    <EditIcon
                      color={selectedUser._id === user._id ? "primary" : ""}
                    />
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
                onClick={(e) => {
                  e.target.disabled = true;
                  handleSave();
                }}
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
                onClick={() => router.push("/order")}
              >
                Back
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Contact;

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
