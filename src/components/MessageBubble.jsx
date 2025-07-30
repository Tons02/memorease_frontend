import React from "react";
import { Box, Typography, Avatar } from "@mui/material";

const MessageBubble = ({ text, isOwn, timestamp }) => {
  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        mb: 1,
        alignItems: "flex-end",
      }}
    >
      <Box>
        <Box
          sx={{
            bgcolor: isOwn ? "#15803d" : "#e0e0e0",
            color: isOwn ? "white" : "black",
            p: 1.5,
            px: 2,
            borderRadius: 3,
            wordBreak: "break-word",

            // Responsive max width
            maxWidth: {
              xs: "100px", // 👈 mobile
              sm: "350px", // 👈 tablet
              md: "650px", // 👈 laptop and up
            },
          }}
        >
          <Typography
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {text}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            mt: 0.5,
            ml: isOwn ? 0 : 1,
            display: "flex",
            justifyContent: isOwn ? "flex-end" : "flex-start",
          }}
        >
          {formatTime(timestamp)}
        </Typography>
      </Box>
    </Box>
  );
};

export default MessageBubble;
