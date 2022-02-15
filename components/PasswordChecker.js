import {
  Button,
  Box,
  TextField,
  ButtonGroup,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import ErrorWarning from "./ErrorWarning";

const PasswordChecker = ({ props }) => {
  const {
    matches,
    password,
    setPassword,
    error,
    setError,
    command,
    action,
    handle,
    setState,
  } = props;

  return (
    <Card variant="outlined">
      <CardContent sx={{ width: "100%" }}>
        <Typography
          sx={{ mb: 2, lineHeight: "125%" }}
          variant="caption"
          component="p"
        >
          {command}
        </Typography>
        <Box className={matches ? "f-col" : ""} sx={{ display: "flex" }}>
          <TextField
            label="Password"
            type="password"
            value={password}
            sx={{ flex: 1 }}
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
              onClick={handle}
            >
              {action}
            </Button>
            <Button
              sx={{
                fontSize: `${matches ? "calc(0.35rem + 1vw)" : ""}`,
                padding: `${matches ? " 0.35rem" : ""}`,
              }}
              onClick={() => {
                setState(null);
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
    </Card>
  );
};

export default PasswordChecker;
