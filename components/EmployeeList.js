import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  TextField,
  ButtonGroup,
} from "@mui/material";
import ErrorWarning from "../components/ErrorWarning";

const EmployeeList = (propsRole) => {
  const {
    matches,
    business,
    setChangeRole,
    nextOwner,
    setNextOwner,
    error,
    setError,
    password,
    setPassword,
  } = propsRole.props;

  return (
    <Card variant="outlined">
      {business && (
        <CardContent sx={{ width: "100%" }}>
          <Typography
            sx={{ mb: 1, lineHeight: "125%" }}
            variant="caption"
            component="p"
          >
            {`Select the next owner and input the business' password to change
            your role into Employee. You will need to login again in order to
            change the role.`}
          </Typography>

          <List>
            {business.team.map((member) => {
              if (member.role === "Employee")
                return (
                  <ListItem
                    className="f-space"
                    sx={{
                      flexWrap: "wrap",
                      border: 1,
                      borderRadius: ".5vw",
                      borderColor: "#bbb",
                      backgroundColor: `${
                        nextOwner?.userId === member.userId
                          ? "#eee"
                          : "transparent"
                      }`,
                    }}
                    key={member.userId}
                  >
                    <Typography>{member.name}</Typography>
                    <Button
                      sx={{
                        fontSize: `${matches ? "calc(0.35rem + 1vw)" : ""}`,
                        padding: `${matches ? " 0.35rem" : ""}`,
                      }}
                      variant={
                        nextOwner?.userId === member.userId
                          ? "text"
                          : "contained"
                      }
                      onClick={() => setNextOwner(member)}
                    >
                      {nextOwner?.userId === member.userId
                        ? "selected"
                        : "select"}
                    </Button>
                  </ListItem>
                );
            })}
          </List>

          <Box
            className={matches ? "f-col" : ""}
            sx={{ display: "flex", mt: 2 }}
          >
            <TextField
              label="Password"
              type="password"
              value={password}
              sx={{ flex: 1, mx: 1 }}
              variant="standard"
              rows={1}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && matches && <ErrorWarning error={error} />}
            <ButtonGroup
              size="small"
              sx={{
                margin: `${matches ? "1rem 0 0" : "0 0 0 1rem"}`,
                alignSelf: "flex-end",
              }}
            >
              <Button
                sx={{
                  fontSize: `${matches ? "calc(0.35rem + 1vw)" : ""}`,
                  padding: `${matches ? " 0.35rem" : ""}`,
                }}
                type="submit"
              >
                Change
              </Button>
              <Button
                sx={{
                  fontSize: `${matches ? "calc(0.35rem + 1vw)" : ""}`,
                  padding: `${matches ? " 0.35rem" : ""}`,
                }}
                onClick={() => {
                  setChangeRole(false);
                  setNextOwner(null);
                  setError(null);
                  setPassword("");
                }}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </Box>
          {error && !matches && <ErrorWarning error={error} />}
        </CardContent>
      )}
    </Card>
  );
};

export default EmployeeList;
