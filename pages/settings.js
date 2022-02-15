import { getSession, signOut } from "next-auth/react";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import EmployeeList from "../components/EmployeeList";
import PasswordChecker from "../components/PasswordChecker";

const Settings = ({ user }) => {
  const { businessId, userId, role } = user;
  const [business, setBusiness] = useState(null);
  const [password, setPassword] = useState("");
  const [wantKick, setWantKick] = useState(null);
  const [resign, setResign] = useState(false);
  const [changeRole, setChangeRole] = useState(false);
  const [nextOwner, setNextOwner] = useState(null);
  const [deleteAcc, setDeleteAcc] = useState(false);
  const [error, setError] = useState(null);
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:450px)");

  const propsRole = {
    matches,
    business,
    setChangeRole,
    nextOwner,
    setNextOwner,
    error,
    setError,
    password,
    setPassword,
  };

  useEffect(async () => {
    try {
      const res = await axios.get("/api/data/business");
      const { business: businessData } = res.data;
      setBusiness(businessData);
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }, []);

  const handleKick = async () => {
    try {
      await axios.post("/api/settings", {
        inputPass: password,
        businessId,
        employeeId: wantKick.userId,
        employeeEmail: wantKick.email,
      });
      window.location.reload();
    } catch (err) {
      setError(err.response.data.msg);
      return;
    }
  };

  const handleResign = async () => {
    try {
      await axios.post("/api/settings", {
        inputPass: password,
        businessId,
        employeeId: userId,
        employeeEmail: user.email,
      });
      signOut({ callbackUrl: `${window.location.origin}/` });
    } catch (err) {
      setError(err.response.data.msg);
      return;
    }
  };

  const handleDeleteAcc = async () => {
    try {
      await axios.post("/api/delete", {
        inputPass: password,
        businessId,
      });
      signOut({ callbackUrl: `${window.location.origin}/` });
    } catch (err) {
      setError(err.response.data.msg);
      return;
    }
  };

  const handleRole = async (e) => {
    e.preventDefault();

    setError(null);
    if (nextOwner == null) {
      setError("Please select an employee to be the next owner");
      return;
    }

    try {
      const res = await axios.post("/api/role", {
        inputPass: password,
        businessId,
        ownerId: user.userId,
        ownerEmail: user.email,
        employeeId: nextOwner.userId,
        employeeEmail: nextOwner.email,
      });

      signOut({ callbackUrl: `${window.location.origin}/` });
      window.location.reload();
    } catch (err) {
      setError(err.response.data.msg);
      return;
    }
  };

  const propsBase = {
    matches,
    password,
    setPassword,
    error,
    setError,
  };

  const propsDelete = {
    ...propsBase,
    command:
      "Please input the company password to delete the whole business account",
    action: "Delete",
    handle: handleDeleteAcc,
    setState: setDeleteAcc,
  };

  const propsKick = {
    ...propsBase,
    command: `Please input the company password to kick ${wantKick?.name}`,
    action: "Kick",
    handle: handleKick,
    setState: setWantKick,
  };

  const propsResign = {
    ...propsBase,
    command: `Please input the company password to
    resign`,
    action: "Resign",
    handle: handleResign,
    setState: setResign,
  };

  return (
    <Container
      sx={{
        py: 5,
      }}
      maxWidth={matches ? "sm" : "lg"}
    >
      <Typography
        className="main-title"
        variant="h4"
        component="h1"
        sx={{ mb: 3 }}
        textAlign={matches ? "center" : "left"}
        gutterBottom
      >
        Settings
      </Typography>
      <Card className="f-row" variant="outlined" size="small" sx={{ p: 3 }}>
        <CardContent
          className={matches ? "f-column" : "f-row"}
          sx={{ px: 5, width: "100%" }}
        >
          <Box sx={{ mr: `${matches ? 0 : 2}` }}>
            <Typography
              className="main-title"
              variant="h5"
              component="h2"
              sx={{ mb: 3 }}
              noWrap
              gutterBottom
            >
              Personal Info{" "}
            </Typography>
            <Avatar
              sx={{ width: "100%", height: "100%" }}
              src={user.image}
              alt={`${user.name}'s profile picture`}
            />
          </Box>
          <Box
            className="f-col"
            sx={{
              marginLeft: `${matches ? "0" : "3rem"}`,
              flex: 1,
              alignSelf: `${matches ? "center" : "flex-end"}`,
              mt: 5,
            }}
          >
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "text.secondary",
                px: 1,
                pb: 1,
                mb: 3,
              }}
              className={matches ? "f-col" : "f-space"}
            >
              <Typography sx={{ fontWeight: 600 }}>Name</Typography>
              <Typography>{user.name}</Typography>
            </Box>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "text.secondary",
                px: 1,
                pb: 1,
                mb: 3,
              }}
              className={matches ? "f-col" : "f-space"}
            >
              <Typography sx={{ fontWeight: 600 }}>Email</Typography>
              <Typography>{user.email}</Typography>
            </Box>
            <Button
              sx={{ px: 2, alignSelf: `${matches ? "none" : "flex-end"}` }}
              variant="contained"
              onClick={() => {
                signOut({ callbackUrl: `${window.location.origin}/` });
              }}
            >
              Sign Out
            </Button>
          </Box>
        </CardContent>
      </Card>

      {business && (
        <>
          <Card
            className="f-row"
            variant="outlined"
            size="small"
            sx={{ p: 3, my: 5 }}
          >
            <CardContent
              sx={{
                padding: `${matches ? "0 1rem" : "0 2rem"}`,
                width: "100%",
              }}
            >
              <Typography
                className="main-title"
                variant="h5"
                component="h2"
                sx={{ mb: 3 }}
                gutterBottom
              >
                Business Info
              </Typography>

              <Box
                className="f-col"
                sx={{
                  flex: 1,
                  alignSelf: `${matches ? "center" : "flex-end"}`,
                  mt: 5,
                }}
              >
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "text.secondary",
                    px: 1,
                    pb: 1,
                    mb: 3,
                  }}
                  className={matches ? "f-col" : "f-space"}
                >
                  <Typography sx={{ fontWeight: 600 }}>Name</Typography>
                  <Typography>{business.name}</Typography>
                </Box>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "text.secondary",
                    px: 1,
                    pb: 1,
                    mb: 3,
                  }}
                  className={matches ? "f-col" : "f-space"}
                >
                  <Typography sx={{ fontWeight: 600 }}>Phone Number</Typography>
                  <Typography>{business.phone}</Typography>
                </Box>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "text.secondary",
                    px: 1,
                    pb: 1,
                    mb: 3,
                  }}
                  className={matches ? "f-col" : "f-space"}
                >
                  <Typography sx={{ fontWeight: 600 }}>Email</Typography>
                  <Typography>{business.email}</Typography>
                </Box>
                <Box
                  sx={{
                    px: 1,
                    pb: 1,
                    mb: 3,
                  }}
                  className="f-col"
                >
                  <Typography sx={{ fontWeight: 600 }}>Team</Typography>
                  <Box>
                    <List>
                      {business.team
                        .sort((a, b) => {
                          if (a == b) return 0;
                          return a.role > b.role ? -1 : 1;
                        })
                        .map((member) => {
                          return (
                            <>
                              <ListItem
                                key={member.userId}
                                sx={{
                                  display: "flex",
                                  border: 1,
                                  borderColor: "#bbb",
                                  borderRadius: "1vw",
                                  mt: 2,
                                  p: 3,
                                }}
                                className={stacks ? "f-col" : "flex"}
                              >
                                <ListItemAvatar
                                  key={member.name}
                                  sx={{ flex: `${matches ? 3 : 1}` }}
                                >
                                  <Avatar
                                    sx={{ width: "100%", height: "100%" }}
                                    src={member.picture}
                                    alt={`${member.name}'s profile picture`}
                                  />
                                </ListItemAvatar>
                                <Box
                                  className={matches ? "f-col" : "f-row"}
                                  sx={{
                                    marginLeft: `${stacks ? "0rem" : "2rem"}`,
                                    flex: `${matches ? 5 : 8}`,
                                  }}
                                >
                                  <ListItemText
                                    key={member.name}
                                    className={stacks ? "f-column" : "f-col"}
                                    primary={member.name}
                                    secondary={member.role}
                                    sx={{
                                      textAlign: `${
                                        stacks ? "center" : "left"
                                      }`,
                                      flex: 5,
                                      marginTop: `${stacks ? "1.5rem" : "0"}`,
                                      marginBottom: `${
                                        matches ? "1.5rem" : "0"
                                      }`,
                                    }}
                                  />

                                  <Box
                                    sx={{
                                      flex: 3,
                                      display: "flex",
                                      justifyContent: `${
                                        matches ? "flex-start" : "flex-end"
                                      }`,
                                    }}
                                  >
                                    {!changeRole &&
                                      role === "Owner" &&
                                      member.role === "Owner" &&
                                      business.team.length > 1 && (
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() => setChangeRole(true)}
                                        >
                                          Change Role
                                        </Button>
                                      )}

                                    {!deleteAcc &&
                                      role === "Owner" &&
                                      member.role === "Owner" &&
                                      business.team.length === 1 && (
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() => setDeleteAcc(true)}
                                        >
                                          Delete Business Account
                                        </Button>
                                      )}

                                    {!wantKick &&
                                      role === "Owner" &&
                                      member.role === "Employee" && (
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() => setWantKick(member)}
                                        >
                                          Kick Employee
                                        </Button>
                                      )}

                                    {role === "Employee" &&
                                      member.userId === userId && (
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() => setResign(member)}
                                        >
                                          Resign
                                        </Button>
                                      )}
                                  </Box>
                                </Box>
                              </ListItem>
                              <Box className="action-password">
                                {changeRole && member.role === "Owner" && (
                                  <form onSubmit={handleRole}>
                                    <EmployeeList props={propsRole} />
                                  </form>
                                )}
                                {deleteAcc && (
                                  <PasswordChecker props={propsDelete} />
                                )}
                                {wantKick === member && (
                                  <PasswordChecker props={propsKick} />
                                )}
                                {resign && resign === member && (
                                  <PasswordChecker props={propsResign} />
                                )}
                              </Box>
                            </>
                          );
                        })}
                    </List>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default Settings;

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
