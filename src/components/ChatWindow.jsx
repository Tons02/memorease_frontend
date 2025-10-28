import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Paper,
  TextField,
  IconButton,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import {
  useGetConversationQuery,
  useGetSpecificMessageQuery,
  useSendMessageMutation,
  useReceivedMessageCountMutation,
} from "../redux/slices/chatSlice";
import { Avatar } from "stream-chat-react";
import MessageBubble from "./MessageBubble";
import { toast } from "sonner";

const ChatWindow = ({ selectedUser, conversationId }) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const LoginUser = JSON.parse(localStorage.getItem("user"));

  const {
    data: messagesData,
    isLoading,
    isError,
    refetch: messageRefetch,
  } = useGetSpecificMessageQuery({ id: conversationId });

  // Get conversations query to refetch conversation list
  const { refetch: conversationRefetch } = useGetConversationQuery();

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [receivedMessageCount] = useReceivedMessageCountMutation();

  const messages = messagesData?.data?.messages || [];

  // Mark messages as read when conversation is opened or messages are loaded
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (conversationId && selectedUser) {
        try {
          await receivedMessageCount({
            params: { id: conversationId },
          }).unwrap();

          // Refetch conversations to update the unread counts in the sidebar
          conversationRefetch();
        } catch (error) {
          console.error("Failed to mark messages as read:", error);
        }
      }
    };

    if (conversationId) {
      messageRefetch?.();
      markMessagesAsRead();
    }
  }, [
    conversationId,
    selectedUser,
    messageRefetch,
    receivedMessageCount,
    conversationRefetch,
  ]);

  // Mark messages as read when user starts typing
  const handleTextChange = async (e) => {
    const newText = e.target.value;
    setText(newText);

    // If user starts typing (first character), mark messages as read
    if (newText.length === 1 && text.length === 0) {
      try {
        await receivedMessageCount({
          params: { id: conversationId },
        }).unwrap();

        // Refetch conversations to update the unread counts
        conversationRefetch();
      } catch (error) {
        console.error("Failed to mark messages as read while typing:", error);
      }
    }
  };

  // Also mark as read when user focuses on the text field
  const handleTextFieldFocus = async () => {
    if (conversationId) {
      try {
        await receivedMessageCount({
          params: { id: conversationId },
        }).unwrap();

        // Refetch conversations to update the unread counts
        conversationRefetch();
      } catch (error) {
        console.error("Failed to mark messages as read on focus:", error);
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        URL.revokeObjectURL(attachment.preview);
      });
    };
  }, [attachments]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Filter only images and videos and create preview URLs
    const validFiles = files
      .filter((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
          toast.error(`${file.name} is not an image or video`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type,
      }));

    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove attachment from list
  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => {
      // Revoke the preview URL to free memory
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSend = async () => {
    if (!text.trim() && attachments.length === 0) return;

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("conversation_id", conversationId);
      formData.append("content", text);

      // Append all attachments (use the file object, not the wrapper)
      attachments.forEach((attachment, index) => {
        formData.append(`attachments[${index}]`, attachment.file);
      });

      console.log("formData", formData);

      await sendMessage({
        body: formData,
      }).unwrap();

      // Revoke preview URLs before clearing
      attachments.forEach((attachment) => {
        URL.revokeObjectURL(attachment.preview);
      });

      setText(""); // Clear input
      setAttachments([]); // Clear attachments

      // Refetch messages to show the new message
      messageRefetch();

      // Refetch conversations to update last message and timestamps
      conversationRefetch();
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={2}>
        <Typography color="error">Failed to load messages.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar src={`https://avatar.iran.liara.run/public`} />
        <Typography variant="h6">{selectedUser.name}</Typography>
      </Box>
      <Divider />

      {/* Message List */}
      <Box
        sx={{ flex: 1, overflowY: "auto", p: 2, backgroundColor: "#f5f5f5" }}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg?.id}
            text={msg?.body}
            isOwn={msg?.sender_id === LoginUser?.id}
            timestamp={msg?.created_at}
            attachments={msg?.attachments}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box component={Paper} square sx={{ p: 2 }}>
        {/* Attachment Preview - Messenger Style */}
        {attachments.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              mb: 2,
              p: 1,
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
            }}
          >
            {attachments.map((attachment, index) => (
              <Box
                key={index}
                sx={{
                  position: "relative",
                  width: "100px",
                  height: "100px",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid #ddd",
                }}
              >
                {/* Close Button */}
                <IconButton
                  size="small"
                  onClick={() => handleRemoveAttachment(index)}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                    },
                    zIndex: 1,
                    padding: "4px",
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>

                {/* Image/Video Preview */}
                {attachment.type.startsWith("image/") ? (
                  <img
                    src={attachment.preview}
                    alt={attachment.file.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <video
                    src={attachment.preview}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Input Area - maintaining your original layout */}
        <Box sx={{ display: "flex" }}>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          {/* Attach File Button */}
          <IconButton
            color="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            sx={{ mr: 1 }}
          >
            <AttachFileIcon />
          </IconButton>

          {/* Text Input */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={text}
            disabled={isSending}
            onChange={handleTextChange}
            onFocus={handleTextFieldFocus}
            onKeyPress={handleKeyPress}
            multiline
          />

          {/* Send Button */}
          <IconButton
            color="secondary"
            onClick={handleSend}
            disabled={isSending || (!text.trim() && attachments.length === 0)}
          >
            {isSending ? (
              <CircularProgress size={20} color="secondary" />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow;
