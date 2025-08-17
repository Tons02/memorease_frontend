import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton,
} from "@mui/material";
import { Check, ArrowBack, Chat, Add } from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";

import ChatUserList from "../../components/ChatUserList";
import ChatWindow from "../../components/ChatWindow";
import DialogComponent from "../../components/DialogComponent";

import { useGetUserQuery } from "../../redux/slices/userSlice";
import {
  useAddConversationMutation,
  useGetConversationQuery,
  useGetSpecificMessageQuery,
} from "../../redux/slices/chatSlice";

import { startConversationSchema } from "../../validations/validation";

const MessengerPage = () => {
  const LoginUser = JSON.parse(localStorage.getItem("user"));
  const [selectedUser, setSelectedUser] = useState(null);
  const [openNewChat, setOpenNewChat] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // For mobile view switching
  const [mobileView, setMobileView] = useState("list"); // "list" or "chat"

  // Form setup for new conversation
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { user_id: "" },
    resolver: yupResolver(startConversationSchema),
  });

  const [startConversation, { isLoading: isStarting }] =
    useAddConversationMutation();

  // Fetch user list for dropdown
  const { data: users, isLoading: usersLoading } = useGetUserQuery({
    pagination: "none",
    role_type: LoginUser?.role_type === "admin" ? "" : "admin",
  });

  // Chat Data Fetchers
  const { data: conversationsData, refetch: conversationRefetch } =
    useGetConversationQuery();

  const { refetch: messageRefetch } = useGetSpecificMessageQuery(
    { id: selectedUser?.conversationId },
    { skip: !selectedUser?.conversationId }
  );

  // Real-time listener for new messages
  useEffect(() => {
    if (!LoginUser?.id) return;

    const channel = window.Echo.private(`user.${LoginUser.id}`);

    channel.listen(".message.sent", (e) => {
      console.log("New message received", e.message);
      conversationRefetch?.();
      if (e.message.conversation_id === selectedUser?.conversationId) {
        messageRefetch?.();
      }
    });

    return () => {
      window.Echo.leave(`user.${LoginUser.id}`);
    };
  }, [LoginUser?.id, selectedUser?.conversationId]);

  // Start new conversation
  const handleStartConversation = async (data) => {
    try {
      const response = await startConversation(data).unwrap();
      toast.success(response?.message);
      setOpenNewChat(false);
      reset();
      conversationRefetch?.();
    } catch (error) {
      console.log(error?.data?.errors);
      toast.error(error?.data?.errors?.[0]?.detail || "Something went wrong");
    }
  };

  // Socket for new conversation
  useEffect(() => {
    if (!LoginUser?.id) return;
    console.log("🟢 New conversation received via socket:", LoginUser.id);

    const channel = window.Echo.private(`chat.${LoginUser.id}`);

    channel.listen(".conversation.created", (e) => {
      console.log("🟢 New conversation received via socket:", e);
      conversationRefetch?.();
      toast.success(`New chat started with ${e.conversation.name}`);
    });

    return () => {
      window.Echo.leave(`chat.${LoginUser.id}`);
    };
  }, [LoginUser?.id]);

  // Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isMobile) {
      setMobileView("chat");
    }
  };

  // Handle back button on mobile
  const handleBackToList = () => {
    if (isMobile) {
      setMobileView("list");
      setSelectedUser(null);
    }
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "calc(100vh - 100px)", // Adjust based on your header/footer
          maxHeight: "800px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          elevation={2}
          sx={{
            height: "100%",
            display: "flex",
            overflow: "hidden",
          }}
        >
          {/* Desktop Layout */}
          {!isMobile && (
            <>
              {/* Sidebar */}
              <Box
                sx={{
                  width: 350,
                  minWidth: 300,
                  maxWidth: 400,
                  borderRight: 1,
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "background.paper",
                }}
              >
                {/* Sidebar Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0, // Prevent shrinking
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chat color="secondary" />
                    <Box sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                      Messages
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    onClick={() => setOpenNewChat(true)}
                    sx={{
                      minWidth: "auto",
                      px: 2,
                      color: "primary.light",
                    }}
                  >
                    New
                  </Button>
                </Box>

                {/* Chat User List - Scrollable */}
                <Box
                  sx={{
                    flex: 1, // Take remaining space
                    overflowY: "auto", // Enable scrolling
                    minHeight: 0, // Critical for flex scrolling
                  }}
                >
                  <ChatUserList
                    onSelectUser={handleSelectUser}
                    selectedUser={selectedUser}
                  />
                </Box>
              </Box>

              {/* Chat Window */}
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "grey.50",
                  overflow: "hidden", // Prevent overflow
                }}
              >
                {selectedUser ? (
                  <ChatWindow
                    selectedUser={selectedUser}
                    conversationId={selectedUser.conversationId}
                  />
                ) : (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 2,
                      color: "text.secondary",
                    }}
                  >
                    <Chat sx={{ fontSize: 64, opacity: 0.3 }} />
                    <Box sx={{ fontSize: "1.2rem", fontWeight: 500 }}>
                      Select a conversation to start messaging
                    </Box>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => setOpenNewChat(true)}
                      startIcon={<Chat />}
                    >
                      Start New Conversation
                    </Button>
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* Mobile Layout */}
          {isMobile && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
              }}
            >
              {mobileView === "list" && (
                <>
                  {/* Mobile Header */}
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: 1,
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "background.paper",
                      flexShrink: 0, // Prevent shrinking
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chat color="secondary" />
                      <Box sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                        Messages
                      </Box>
                    </Box>
                    <IconButton
                      color="secondary"
                      onClick={() => setOpenNewChat(true)}
                      sx={{
                        backgroundColor: "secondary.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "secondary.dark",
                        },
                        width: 40,
                        height: 40,
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Box>

                  {/* Mobile Chat List - Scrollable */}
                  <Box
                    sx={{
                      flex: 1, // Take remaining space
                      overflowY: "auto", // Enable scrolling
                      minHeight: 0, // Critical for flex scrolling
                    }}
                  >
                    <ChatUserList
                      onSelectUser={handleSelectUser}
                      selectedUser={selectedUser}
                    />
                  </Box>
                </>
              )}

              {mobileView === "chat" && selectedUser && (
                <>
                  {/* Mobile Chat Header */}
                  <Box
                    sx={{
                      p: 1,
                      borderBottom: 1,
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      backgroundColor: "background.paper",
                      flexShrink: 0, // Prevent shrinking
                    }}
                  >
                    <IconButton onClick={handleBackToList} size="small">
                      <ArrowBack />
                    </IconButton>
                    <Box sx={{ fontWeight: 600 }}>
                      {selectedUser.name || "Chat"}
                    </Box>
                  </Box>

                  {/* Mobile Chat Window - Full height remaining */}
                  <Box
                    sx={{
                      flex: 1, // Take remaining space
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden", // Prevent overflow
                      minHeight: 0, // Critical for flex
                    }}
                  >
                    <ChatWindow
                      selectedUser={selectedUser}
                      conversationId={selectedUser.conversationId}
                    />
                  </Box>
                </>
              )}

              {mobileView === "chat" && !selectedUser && (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                  }}
                >
                  <Button variant="outlined" onClick={handleBackToList}>
                    Back to Messages
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>

      {/* New Conversation Dialog */}
      <DialogComponent
        open={openNewChat}
        onClose={() => setOpenNewChat(false)}
        onSubmit={handleSubmit(handleStartConversation)}
        title={"Start New Conversation"}
        isLoading={isStarting}
        submitIcon={<Check />}
        submitLabel={"Start"}
        formMethods={{ handleSubmit, reset }}
        isValid={true}
        isDirty={true}
      >
        <FormControl fullWidth error={!!errors.user_id} sx={{ mt: 2 }}>
          <InputLabel id="select-user-label">Select User</InputLabel>
          <Controller
            name="user_id"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId="select-user-label"
                label="Select User"
              >
                {usersLoading ? (
                  <MenuItem disabled>
                    <CircularProgress
                      color="secondary"
                      size={20}
                      sx={{ mr: 1 }}
                    />
                    Loading...
                  </MenuItem>
                ) : (
                  users?.data?.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.fname} {user.mi && `${user.mi}.`} {user.lname}{" "}
                      {user.suffix} - {user.role_type}
                    </MenuItem>
                  ))
                )}
              </Select>
            )}
          />
          {errors.user_id && (
            <Box
              sx={{
                color: "error.main",
                mt: 0.5,
                fontSize: "0.75rem",
                ml: 1.75,
              }}
            >
              {errors.user_id.message}
            </Box>
          )}
        </FormControl>
      </DialogComponent>
    </>
  );
};

export default MessengerPage;
