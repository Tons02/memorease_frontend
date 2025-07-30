import React, { useState } from "react";
import { Grid, Box } from "@mui/material";
import ChatUserList from "../../components/ChatUserList";
import ChatWindow from "../../components/ChatWindow";

const MessengerPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  console.log(selectedUser);
  return (
    <Box
      sx={{
        width: "100%",
        height: "80vh", // Adjust if you have a topbar
        overflow: "hidden",
      }}
    >
      <Grid container sx={{ height: "100%" }}>
        {/* Chat User List */}
        <Grid
          item
          xs={3}
          sx={{ height: "100%", width: "20%", borderRight: "1px solid #ddd" }}
        >
          <Box sx={{ height: "100%", overflowY: "auto" }}>
            <ChatUserList
              onSelectUser={setSelectedUser}
              selectedUser={selectedUser}
            />
          </Box>
        </Grid>

        {/* Chat Panel */}
        <Grid item xs={9} sx={{ height: "100%", width: "80%" }}>
          {selectedUser ? (
            <ChatWindow
              selectedUser={selectedUser}
              conversationId={selectedUser.conversationId}
            />
          ) : (
            <Box
              sx={{
                height: "100%",
                width: "80%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Select a user to start chatting
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default MessengerPage;
