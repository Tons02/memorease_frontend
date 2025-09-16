import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Paper,
  TextField,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
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
  const messagesEndRef = useRef(null);
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

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      await sendMessage({
        body: {
          conversation_id: conversationId,
          content: text,
        },
      }).unwrap();

      setText(""); // Clear input

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
            key={msg.id}
            text={msg.body}
            isOwn={msg.sender_id === LoginUser.id}
            timestamp={msg.created_at}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box component={Paper} square sx={{ display: "flex", p: 2 }}>
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
        <IconButton color="secondary" onClick={handleSend} disabled={isSending}>
          {isSending ? (
            <CircularProgress size={20} color="secondary" />
          ) : (
            <SendIcon />
          )}
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatWindow;
