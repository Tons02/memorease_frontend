import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Component for the image dialog
const ImageDialog = ({
  open,
  onClose,
  imageUrl,
  title = "Proof of Payment",
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: "transparent",
          boxShadow: "none",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: "8px 8px 0 0",
        }}
      >
        {title}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: 0,
          backgroundColor: "white",
          borderRadius: "0 0 8px 8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={imageUrl}
          alt="Proof of Payment"
          style={{
            maxWidth: "100%",
            maxHeight: "80vh",
            padding: "20px",
            objectFit: "contain",
            borderRadius: "0 0 8px 8px",
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageDialog;
