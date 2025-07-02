import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const FileUploadInput = ({ title, imageSetValue, previousImageUrl }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    imageSetValue(name, file);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
      {/* Hidden input */}
      <input
        accept="image/*"
        type="file"
        id="profile-picture-upload"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Preview Image */}
      <Typography variant="caption" display="block" color="text.secondary">
        {title}
        {preview ? " New Preview" : " Current Photo"}
      </Typography>
      <img
        src={preview || previousImageUrl}
        alt="Profile Preview"
        style={{
          width: 200,
          height: 150,
          objectFit: "contain",
          border: "1px solid #ccc",
          borderRadius: 8,
          backgroundColor: "#f5f5f5",
        }}
      />

      {/* Upload Button */}
      <label htmlFor="profile-picture-upload">
        <Button
          variant="contained"
          color="success"
          component="span"
          startIcon={<PhotoCamera />}
        >
          Upload Photo
        </Button>
      </label>
    </Box>
  );
};

export default FileUploadInput;
