import React, { useEffect, useState } from "react";
import { Box, Button, Typography, IconButton } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";

const FileUploadInput = ({
  title,
  name,
  value,
  onChange,
  previousImageUrl,
  error,
  helperText,
  setValue,
}) => {
  const [preview, setPreview] = useState(null);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    if (typeof value === "string") {
      setPreview(value);
      detectFileType(value);
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      detectFileType(value.name);
    } else if (previousImageUrl) {
      setPreview(previousImageUrl); // <-- use previousImageUrl
      detectFileType(previousImageUrl);
    } else {
      setPreview(null);
      setIsVideo(false);
    }
  }, [value, previousImageUrl]);

  const detectFileType = (filename) => {
    const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
    const lower = filename.toLowerCase();
    setIsVideo(videoExtensions.some((ext) => lower.endsWith(ext)));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      onChange(file);
      setValue(name, file);
      detectFileType(file.name);
    } else {
      handleRemoveFile();
    }
  };

  const handleRemoveFile = () => {
    onChange(null);
    setValue(name, null);
    setPreview(null);
    setIsVideo(false);
  };

  console.log(isVideo);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
      {/* Hidden File Input */}
      <input
        accept="image/*,video/*"
        type="file"
        id={`upload-${name}`}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Label */}
      <Typography variant="caption" display="block" color="text.secondary">
        {title}
        {preview ? " (Preview)" : " (No File)"}
      </Typography>

      {/* Preview Container */}
      <Box
        sx={{
          position: "relative",
          width: 200,
          height: 150,
          border: error ? "1px solid red" : "1px solid #ccc",
          borderRadius: 2,
          backgroundColor: "#f5f5f5",
          overflow: "hidden",
        }}
      >
        {/* Show image or video */}
        {preview ? (
          isVideo ? (
            <video
              src={preview || previousImageUrl}
              controls
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <img
              src={preview || previousImageUrl}
              alt="Preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          )
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            No file selected
          </Typography>
        )}

        {/* Remove (Close) Button */}
        {preview && (
          <IconButton
            size="small"
            onClick={handleRemoveFile}
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.8)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Error Text */}
      {error && (
        <Typography variant="caption" color="error">
          {helperText}
        </Typography>
      )}

      {/* Upload Button */}
      <label htmlFor={`upload-${name}`}>
        <Button
          variant="contained"
          color="success"
          component="span"
          startIcon={<PhotoCamera />}
        >
          Upload
        </Button>
      </label>
    </Box>
  );
};

export default FileUploadInput;
