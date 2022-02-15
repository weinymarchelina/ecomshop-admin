import { Box, Typography } from "@mui/material";

const ErrorWarning = ({ error }) => {
  return (
    <Box
      className="f-space"
      sx={{
        p: 2,
        pl: 1,
        pb: 0,
        alignItems: "center",
      }}
    >
      <Typography variant="caption" component="p" color="error.main">
        {error}
      </Typography>
    </Box>
  );
};

export default ErrorWarning;
