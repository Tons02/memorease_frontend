import { Box } from "@mui/material";
import React from "react";
import MessengerPage from "./ChatMessage/MessengerPage";

const Contact = () => {
  return (
    <Box
      sx={{
        height: "90%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <MessengerPage />
    </Box>
  );
};

export default Contact;
