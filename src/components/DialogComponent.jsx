import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const DialogComponent = ({
  open,
  onClose,
  onSubmit,
  title,
  icon,
  isLoading = false,
  submitLabel = "Confirm",
  children,
  submitIcon = null,
  maxWidth = "xs",
  fullWidth = true,
  formMethods = {},
}) => {
  const { handleSubmit, reset } = formMethods;

  const handleClose = () => {
    reset?.(); // Optional reset
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          {icon}
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </Box>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Divider />
        <DialogContent>{children}</DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            disabled={isLoading}
            startIcon={!isLoading && submitIcon}
            sx={{ py: 1.5 }}
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              submitLabel
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DialogComponent;
