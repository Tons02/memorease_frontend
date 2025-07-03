import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const FileUploadInput = ({
  title,
  name,
  value,
  onChange,
  previousImageUrl,
  error,
  helperText,
}) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (typeof value === "string") {
      setPreview(value);
    } else if (value instanceof File) {
      setPreview(URL.createObjectURL(value));
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file); // this will trigger react-hook-form
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
      {/* Hidden File Input */}
      <input
        accept="image/*"
        type="file"
        id={`upload-${name}`}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Label */}
      <Typography variant="caption" display="block" color="text.secondary">
        {title}
        {preview ? " (Preview)" : " (No Image)"}
      </Typography>

      {/* Image Preview */}
      <img
        src={preview || previousImageUrl}
        alt="Preview"
        style={{
          width: 200,
          height: 150,
          objectFit: "contain",
          border: error ? "1px solid red" : "1px solid #ccc",
          borderRadius: 8,
          backgroundColor: "#f5f5f5",
        }}
      />

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
          Upload Photo
        </Button>
      </label>
    </Box>
  );
};

export default FileUploadInput;
