import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  IconButton,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import {
  useGetSpecificMessageQuery,
  useSendMessageMutation,
} from "../../redux/slices/chatSlice";
import { RestaurantOutlined } from "@mui/icons-material";

const ChatPopup = ({ receiverId, conversationId, token, currentUser }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");

  // RTK query hooks
  const { data: initialMessages, isLoading } = useGetSpecificMessageQuery(
    { id: conversationId },
    { skip: !conversationId } // skip query if no conversationId
  );
  const [sendMessageMutation] = useSendMessageMutation();

  // Load initial messages into state
  useEffect(() => {
    if (initialMessages) {
      setName(initialMessages?.data?.messages[0]?.sender?.fname);
      setMessages(initialMessages?.data?.messages);
    }
  }, [initialMessages]);

  // console.log(messages);

  // Laravel Echo subscription
  useEffect(() => {
    if (!conversationId || !window.Echo) return;

    const channel = window.Echo.private(`chat.${conversationId}`);

    channel.listen("MessageSent", (e) => {
      if (e?.message) {
        setMessages((prev) => [...prev, e.message]);
      }
    });

    return () => {
      window.Echo.leave(`chat.${conversationId}`);
    };
  }, [conversationId]);

  // Send message handler
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const result = await sendMessageMutation({
        body: {
          conversation_id: conversationId,
          receiver_id: receiverId,
          content: text,
        },
      });
      // console.log("result", result?.data?.data?.body); this return "asd"

      if (result) {
        // console.log("result", result.data);
        setMessages((prev) => [...prev, result?.data?.data]);
        setText("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // console.log("name", name);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 999,
        }}
      >
        <ChatIcon />
      </IconButton>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: 300,
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Typography variant="h6" mb={2}>
            Chat - {name}
          </Typography>

          <hr />
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {isLoading ? (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              messages.map((msg, i) => (
                <Paper
                  key={i}
                  sx={{
                    p: 1.5,
                    my: 1,
                    mx: 1,
                    maxWidth: "80%",
                    alignSelf:
                      msg.sender_id === currentUser.id
                        ? "flex-end"
                        : "flex-start",
                    backgroundColor:
                      msg.sender_id === currentUser.id ? "#e0f7fa" : "#f1f1f1",
                  }}
                >
                  {msg.body}
                </Paper>
              ))
            )}
          </Box>

          <hr />
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <IconButton onClick={sendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default ChatPopup;
