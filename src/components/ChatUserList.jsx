import React, { useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
  CircularProgress,
  Box,
  Typography,
  TextField,
} from "@mui/material";
import { useGetConversationQuery } from "../redux/slices/chatSlice";
import { toast } from "sonner";

const ChatUserList = ({ onSelectUser, selectedUser }) => {
  const LoginUser = JSON.parse(localStorage.getItem("user")); // Current user
  const {
    data: conversations,
    refetch,
    isLoading,
    isError,
  } = useGetConversationQuery();

  useEffect(() => {
    console.log("Effect run");

    const channel = window.Echo.private(`chat.${LoginUser.id}`);
    channel.listen(".conversation.created", (e) => {
      console.log("New conversation created!", e);
      toast.success("New Conversation");
      refetch();
    });

    return () => {
      window.Echo.leave(`chat.${LoginUser.id}`);
    };
  }, [LoginUser.id]);

  if (isLoading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <CircularProgress color="secondary" size={28} />
      </Box>
    );
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();

    // If same day: show hour
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Else: show date
    return date.toLocaleDateString();
  };

  // Extract "other user" from each conversation
  const usersToDisplay = conversations.data.map((conversation) => {
    const otherUser = conversation.users.find(
      (user) => user.id !== LoginUser.id
    );

    const pivot = conversation.users.find((u) => u.id === LoginUser.id)?.pivot;

    const lastMessage =
      conversation.messages?.[conversation.messages.length - 1];

    const hasUnread =
      lastMessage &&
      pivot?.last_read_at &&
      new Date(lastMessage.created_at) > new Date(pivot.last_read_at);

    return {
      id: otherUser.id,
      name: [
        otherUser.fname,
        otherUser.mi ? `${otherUser.mi}.` : null,
        otherUser.lname,
        otherUser.suffix,
      ]
        .filter(Boolean)
        .join(" "),
      avatar: otherUser.profile_picture,
      conversationId: conversation.id,
      lastMessage: lastMessage?.body || "No messages yet",
      lastMessageTime: lastMessage?.created_at,
      hasUnread,
    };
  });

  return (
    <>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search conversations..."
          variant="outlined"
          size="small"
          onChange={(e) => {
            // optionally implement search/filter logic here
          }}
        />
      </Box>

      <List disablePadding>
        {usersToDisplay.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography>No conversations found</Typography>
          </Box>
        ) : (
          usersToDisplay.map((user) => (
            <ListItem key={user.id} disablePadding>
              <ListItemButton
                selected={selectedUser?.id === user.id}
                onClick={() => onSelectUser(user)}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#e0f2f1",
                  },
                  "&:hover": {
                    backgroundColor: "#f1f1f1",
                  },
                }}
              >
                <Avatar
                  src={`/uploads/${user.avatar}`}
                  sx={{ mr: 2 }}
                  alt={user.name}
                >
                  {user.name[0]}
                </Avatar>
                <ListItemText
                  primary={
                    <Typography fontWeight={user.hasUnread ? "bold" : "normal"}>
                      {user.name}
                    </Typography>
                  }
                  secondary={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        pr: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        noWrap
                        sx={{
                          maxWidth: "70%",
                          fontWeight: user.hasUnread ? "bold" : "normal",
                        }}
                      >
                        {user.lastMessage}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatTime(user.lastMessageTime)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </>
  );
};

export default ChatUserList;
