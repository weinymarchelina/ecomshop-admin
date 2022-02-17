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
  IconButton,
  Modal,
  FormControl,
  TextField,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import EmployeeList from "../components/EmployeeList";
import PasswordChecker from "../components/PasswordChecker";
import SettingsIcon from "@mui/icons-material/Settings";
import ErrorWarning from "../components/ErrorWarning";
import CheckCircle from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";

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
  const [passwordError, setPasswordError] = useState(null);

  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [promoted, setPromoted] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

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
      const { business: businessData, promoted } = res.data;
      setBusiness(businessData);
      setPromoted(promoted);
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }, []);

  const handleClose = () => {
    setModal(false);
    setPasswordError(null);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccessMsg(null);
  };

  const handleEditClose = () => {
    setEditModal(false);
    setError(null);
    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setSuccessMsg(null);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    console.log(oldPassword);
    console.log(newPassword);
    console.log(confirmPassword);

    if (newPassword !== confirmPassword) {
      setPasswordError(`New password and confirm new password don't match`);
      return;
    }

    try {
      const res = await axios.post("/api/settings/password", {
        oldPassword,
        newPassword,
        businessId,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg(res.data.msg);
    } catch (err) {
      setPasswordError(err.response?.data.msg);

      return;
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!name && !phone & !email) {
      setError(`Please input at least one of the fields`);
      return;
    } else if (
      name === business.name &&
      Number(phone) === business.phone &&
      email === business.email
    ) {
      setError(`New information and old information cannot be the same`);
      return;
    }

    const newName = name || business.name;
    const newPhone = phone || business.phone;
    const newEmail = email || business.email;

    try {
      const res = await axios.post("/api/settings/edit", {
        newName,
        newPhone,
        newEmail,
        password,
        businessId,
      });
      setName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setSuccessMsg(res.data.msg);
    } catch (err) {
      setError(err.response?.data.msg);

      return;
    }
  };

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
      await axios.post("/api/role", {
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
      "Input the business' password to delete the whole business account. Warning: this action is irreversible",
    action: "Delete",
    handle: handleDeleteAcc,
    setState: setDeleteAcc,
  };

  const propsKick = {
    ...propsBase,
    command: `Input the business' password to kick ${wantKick?.name}`,
    action: "Kick",
    handle: handleKick,
    setState: setWantKick,
  };

  const propsResign = {
    ...propsBase,
    command: `Please input the business' password to
    resign`,
    action: "Resign",
    handle: handleResign,
    setState: setResign,
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: `${matches ? "95vw" : "calc(28rem + 35vw)"}`,
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 5,
    mr: 1,
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
          <Modal open={promoted}>
            <Box sx={modalStyle} className="f-col">
              <Typography variant="h6" component="p">
                Congratulations! You have been promoted as the new owner of{" "}
                {business.name}! Please sign out to change your role into the
                owner.{" "}
              </Typography>
              <Button
                sx={{
                  px: 2,
                  mt: 3,
                  alignSelf: `${matches ? "none" : "flex-end"}`,
                }}
                variant="contained"
                onClick={() => {
                  signOut({ callbackUrl: `${window.location.origin}/` });
                }}
              >
                Sign Out
              </Button>
            </Box>
          </Modal>
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
              <Box
                className="f-space"
                sx={{
                  mt: 2,
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <Typography className="main-title" variant="h5" component="h2">
                  Business Info
                </Typography>

                {role === "Owner" && (
                  <Box>
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditModal(true);
                        setChangeRole(false);
                        setWantKick(null);
                        setDeleteAcc(false);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={() => setModal(true)}>
                      <SettingsIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Modal open={editModal} onClose={handleEditClose}>
                <Box sx={modalStyle}>
                  <Typography
                    className="main-title"
                    variant={stacks ? "h6" : "h5"}
                    component="h2"
                    sx={{ mb: 3 }}
                    textAlign="center"
                  >
                    Change Business Information
                  </Typography>
                  <form autoComplete="off" onSubmit={handleEdit}>
                    <FormControl fullWidth>
                      {!successMsg && (
                        <>
                          <Typography sx={{ mb: 2 }} textAlign="center">
                            Input at least one of the fields below in order to
                            change the information.{" "}
                          </Typography>
                          <TextField
                            label="New Name"
                            fullWidth
                            rows={1}
                            type="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{ mb: 4 }}
                            variant="standard"
                          />

                          <TextField
                            label="New Phone Number"
                            fullWidth
                            rows={1}
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            sx={{ mb: 4 }}
                            variant="standard"
                          />

                          <TextField
                            label="New Email"
                            fullWidth
                            rows={1}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 4 }}
                            variant="standard"
                          />

                          <TextField
                            label="Password"
                            fullWidth
                            rows={1}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            variant="standard"
                            required
                          />

                          {error && <ErrorWarning error={error} />}
                        </>
                      )}

                      {successMsg && (
                        <Container className="f-column">
                          <CheckCircle
                            color="success"
                            sx={{ m: 2, fontSize: 100 }}
                          />
                          <Typography
                            color="success.main"
                            variant="h6"
                            component="p"
                            sx={{ width: "20ch" }}
                            textAlign="center"
                          >
                            {successMsg}
                          </Typography>
                        </Container>
                      )}

                      <Box
                        sx={{
                          mt: 3,
                          alignSelf: `${stacks ? "center" : "flex-end"}`,
                        }}
                      >
                        {!successMsg && (
                          <>
                            <Button
                              sx={{ px: 2, py: 1, mr: 1 }}
                              size="small"
                              type="submit"
                              variant="contained"
                            >
                              Change
                            </Button>
                            <Button
                              sx={{ px: 2, py: 1 }}
                              onClick={handleEditClose}
                              size="small"
                              variant="outlined"
                            >
                              Close
                            </Button>
                          </>
                        )}
                        {successMsg && (
                          <Button
                            sx={{ px: 2, py: 1 }}
                            onClick={() => window.location.reload()}
                            size="small"
                            variant="outlined"
                          >
                            Close
                          </Button>
                        )}
                      </Box>
                    </FormControl>
                  </form>
                </Box>
              </Modal>

              <Modal open={modal} onClose={handleClose}>
                <Box sx={modalStyle}>
                  <Typography
                    className="main-title"
                    variant={stacks ? "h6" : "h5"}
                    component="h2"
                    sx={{ mb: 3 }}
                    textAlign="center"
                  >
                    Change Business Password
                  </Typography>
                  <form autoComplete="off" onSubmit={handlePassword}>
                    <FormControl fullWidth>
                      {!successMsg && (
                        <>
                          <TextField
                            label="Current Password"
                            fullWidth
                            rows={1}
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            sx={{ mb: 4 }}
                            variant="standard"
                            required
                          />

                          <TextField
                            label="New Password"
                            fullWidth
                            rows={1}
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            sx={{ mb: 4 }}
                            variant="standard"
                            required
                          />

                          <TextField
                            label="Confirm New Password"
                            fullWidth
                            rows={1}
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            variant="standard"
                            required
                          />

                          {passwordError && (
                            <ErrorWarning error={passwordError} />
                          )}
                        </>
                      )}

                      {successMsg && (
                        <Container className="f-column">
                          <CheckCircle
                            color="success"
                            sx={{ m: 2, fontSize: 100 }}
                          />
                          <Typography
                            color="success.main"
                            variant="h6"
                            component="p"
                            sx={{ width: "20ch" }}
                            textAlign="center"
                          >
                            {successMsg}
                          </Typography>
                        </Container>
                      )}

                      <Box
                        sx={{
                          mt: 3,
                          alignSelf: `${stacks ? "center" : "flex-end"}`,
                        }}
                      >
                        {!successMsg && (
                          <Button
                            sx={{ px: 2, py: 1, mr: 1 }}
                            size="small"
                            type="submit"
                            variant="contained"
                          >
                            Change
                          </Button>
                        )}
                        <Button
                          sx={{ px: 2, py: 1 }}
                          onClick={handleClose}
                          size="small"
                          variant="outlined"
                        >
                          Close
                        </Button>
                      </Box>
                    </FormControl>
                  </form>
                </Box>
              </Modal>

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
                                          onClick={() => {
                                            setChangeRole(true);
                                            setWantKick(null);
                                          }}
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
                                          onClick={() => {
                                            setWantKick(member);
                                            setChangeRole(false);
                                          }}
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
