import { Modal, Typography, Box } from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";

const LoadingModal = ({ loading }) => {
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "95vw",
    maxWidth: "calc(25rem + 30vw)",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 5,
    mr: 1,
  };

  return (
    <Modal
      open={loading}
      onClose={() => {
        !loading;
      }}
    >
      <Box sx={modalStyle} className="f-column">
        <Typography variant="h5" component="p" textAlign={"center"}>
          Uploading Product...
        </Typography>
        <PublishIcon sx={{ fontSize: 60, my: 3 }} className="shake-vertical" />
      </Box>
    </Modal>
  );
};

export default LoadingModal;
