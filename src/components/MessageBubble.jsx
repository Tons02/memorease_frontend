import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const MessageBubble = ({ text, isOwn, timestamp, attachments }) => {
  // Parse attachments if it's a string
  let parsedAttachments = [];
  try {
    parsedAttachments =
      typeof attachments === "string" ? JSON.parse(attachments) : attachments;
  } catch (error) {
    console.error("Failed to parse attachments:", error);
  }

  const formattedTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          maxWidth: "70%",
          backgroundColor: isOwn ? "#e3f2fd" : "#ffffff",
          borderRadius: 2,
        }}
      >
        {/* Attachments Display */}
        {parsedAttachments && parsedAttachments.length > 0 && (
          <Box
            sx={{
              mb: text ? 1 : 0,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {parsedAttachments.map((attachment, index) => {
              const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(
                attachment.url
              );
              const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(attachment.url);

              return (
                <Box key={index}>
                  {isImage ? (
                    <img
                      src={attachment.url}
                      alt={`attachment-${index}`}
                      style={{
                        maxWidth: "300px",
                        width: "100%",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "block",
                      }}
                      onClick={() => window.open(attachment.url, "_blank")}
                    />
                  ) : isVideo ? (
                    <video
                      src={attachment.url}
                      controls
                      style={{
                        maxWidth: "300px",
                        width: "100%",
                        borderRadius: "8px",
                        display: "block",
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="textSecondary">
                      📎 {attachment.name || "Attachment"}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Message Text */}
        {text && (
          <Typography
            variant="body1"
            sx={{
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {text}
          </Typography>
        )}

        {/* Timestamp */}
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            display: "block",
            mt: 0.5,
            textAlign: "right",
          }}
        >
          {formattedTime(timestamp)}
        </Typography>
      </Paper>
    </Box>
  );
};

export default MessageBubble;
