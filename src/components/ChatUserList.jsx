import React, { useEffect, useState, useMemo } from "react";
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
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Search, Person } from "@mui/icons-material";
import { useGetConversationQuery } from "../redux/slices/chatSlice";
import { toast } from "sonner";

const ChatUserList = ({ onSelectUser, selectedUser }) => {
  const LoginUser = JSON.parse(localStorage.getItem("user")); // Current user
  const [searchQuery, setSearchQuery] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Move all hooks to the top before any conditional returns
  const {
    data: conversations,
    refetch,
    isLoading,
    isError,
  } = useGetConversationQuery();

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

  // Extract "other user" from each conversation and sort by date
  const usersToDisplay = useMemo(() => {
    if (!conversations?.data) return [];

    const users = conversations.data.map((conversation) => {
      const otherUser = conversation.users.find(
        (user) => user.id !== LoginUser.id
      );

      const pivot = conversation.users.find(
        (u) => u.id === LoginUser.id
      )?.pivot;

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

    // Sort by last message time (most recent first)
    return users.sort((a, b) => {
      const dateA = new Date(a.lastMessageTime || 0);
      const dateB = new Date(b.lastMessageTime || 0);
      return dateB - dateA; // Descending order (newest first)
    });
  }, [conversations?.data, LoginUser.id]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      // When no search query, return sorted users (already sorted by date)
      return usersToDisplay;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = usersToDisplay.filter((user) => {
      const nameMatch = user.name.toLowerCase().includes(query);
      const messageMatch = user.lastMessage.toLowerCase().includes(query);
      return nameMatch || messageMatch;
    });

    // When searching, you might want to maintain date sorting or sort by relevance
    // Here we maintain the date sorting even during search
    return filtered;
  }, [usersToDisplay, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // NOW we can do conditional rendering after all hooks are called
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

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Search Box */}
      <Box
        sx={{
          p: isMobile ? 1 : 2,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search conversations..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "text.secondary", fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: "grey.50",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "grey.300",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            },
          }}
        />

        {/* Search Results Count */}
        {searchQuery && (
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              color: "text.secondary",
              fontSize: "0.75rem",
            }}
          >
            {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}{" "}
            found
          </Typography>
        )}
      </Box>

      {/* Scrollable Conversation List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
          // Custom scrollbar for better UX
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "grey.100",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "grey.400",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "grey.600",
          },
        }}
      >
        <List disablePadding>
          {filteredUsers.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              {searchQuery ? (
                <>
                  <Search sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">
                    No conversations found for "{searchQuery}"
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Try searching for a different name or message
                  </Typography>
                </>
              ) : (
                <>
                  <Person sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">No conversations yet</Typography>
                  <Typography
                    variant="caption"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Start a new conversation to get started
                  </Typography>
                </>
              )}
            </Box>
          ) : (
            filteredUsers.map((user) => (
              <ListItem key={user.id} disablePadding>
                <ListItemButton
                  selected={selectedUser?.id === user.id}
                  onClick={() => onSelectUser(user)}
                  sx={{
                    py: isMobile ? 1 : 1.5,
                    px: isMobile ? 1 : 2,
                    "&.Mui-selected": {
                      backgroundColor: "secondary.light",
                      "&:hover": {
                        backgroundColor: "secondary.light",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "grey.50",
                    },
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <Avatar
                    src={user.avatar ? `/uploads/${user.avatar}` : undefined}
                    sx={{
                      mr: isMobile ? 1.5 : 2,
                      width: isMobile ? 40 : 48,
                      height: isMobile ? 40 : 48,
                      backgroundColor: "secondary.main",
                      color: "white",
                      fontSize: isMobile ? "1rem" : "1.2rem",
                    }}
                    alt={user.name}
                  >
                    {user.name[0]?.toUpperCase()}
                  </Avatar>

                  <ListItemText
                    primary={
                      <Typography
                        fontWeight={user.hasUnread ? "bold" : "normal"}
                        sx={{
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          color: user.hasUnread
                            ? "text.primary"
                            : "text.primary",
                        }}
                        noWrap
                      >
                        {user.name}
                      </Typography>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{
                            maxWidth: "70%",
                            fontWeight: user.hasUnread ? "500" : "normal",
                            fontSize: isMobile ? "0.75rem" : "0.875rem",
                          }}
                        >
                          {user.lastMessage}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {user.hasUnread && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "secondary.main",
                              }}
                            />
                          )}
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: isMobile ? "0.65rem" : "0.75rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatTime(user.lastMessageTime)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Box>
  );
};

export default ChatUserList;
