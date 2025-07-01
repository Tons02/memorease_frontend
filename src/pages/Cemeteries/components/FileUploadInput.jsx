import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const FileUploadInput = ({
  cemeteryRegister,
  cemeterySetValue,
  previousImageUrl,
}) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    // ✅ This line is very important
    cemeterySetValue("profile_picture", file);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
      {/* Hidden input */}
      <input
        accept="image/*"
        type="file"
        id="profile-picture-upload"
        style={{ display: "none" }}
        onChange={handleFileChange} // ✅ Must set value manually
      />

      {/* Preview Image */}
      <Typography variant="caption" display="block" color="text.secondary">
        {preview ? "New Preview" : "Current Photo"}
      </Typography>
      <img
        src={preview || previousImageUrl}
        alt="Profile Preview"
        style={{
          width: 150,
          height: 150,
          objectFit: "cover",
          border: "1px solid #ccc",
          borderRadius: 8,
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
