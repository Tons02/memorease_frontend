import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import {
  Close as CloseIcon,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useState, useEffect } from "react";

const ImageViewerDialog = ({
  open,
  onClose,
  images = [],
  initialIndex = 0,
  lotTitle = "Lot Images",
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when dialog opens with new images
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [open, initialIndex]);

  const handlePrevImage = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      handlePrevImage();
    } else if (event.key === "ArrowRight") {
      handleNextImage();
    } else if (event.key === "Escape") {
      onClose();
    }
  };

  if (!images.length) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      onKeyDown={handleKeyDown}
      sx={{
        "& .MuiDialog-paper": {
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {lotTitle}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: "relative" }}>
        {/* Main Image Container */}
        <Box sx={{ position: "relative", backgroundColor: "#000" }}>
          <Box
            component="img"
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            sx={{
              width: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              display: "block",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />

          {/* Navigation Arrows - Only show if multiple images */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
                  width: 48,
                  height: 48,
                }}
              >
                <ChevronLeft fontSize="large" />
              </IconButton>

              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
                  width: 48,
                  height: 48,
                }}
              >
                <ChevronRight fontSize="large" />
              </IconButton>

              {/* Image Counter */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                {currentIndex + 1} / {images.length}
              </Box>
            </>
          )}
        </Box>

        {/* Thumbnail Navigation - Only show if multiple images */}
        {images.length > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              p: 2,
              backgroundColor: "#f5f5f5",
              overflowX: "auto",
            }}
          >
            {images.map((image, index) => (
              <Box
                key={index}
                component="img"
                src={image}
                alt={`Thumbnail ${index + 1}`}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 1,
                  cursor: "pointer",
                  border:
                    index === currentIndex
                      ? "3px solid #1976d2"
                      : "2px solid transparent",
                  opacity: index === currentIndex ? 1 : 0.7,
                  transition: "all 0.2s",
                  "&:hover": {
                    opacity: 1,
                    transform: "scale(1.05)",
                  },
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewerDialog;
