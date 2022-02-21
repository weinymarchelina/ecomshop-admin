import { Modal, Typography } from "@mui/material";
import { Box } from "@mui/system";

const LoadingModal = ({ loading }) => {
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
    <Modal open={loading} onClose={!loading}>
      <Box sx={modalStyle} className="f-column">
        <Typography>Loading...</Typography>
      </Box>
    </Modal>
  );
};

export default LoadingModal;
