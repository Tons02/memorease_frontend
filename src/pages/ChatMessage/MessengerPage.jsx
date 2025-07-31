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
} from "@mui/material";
import ChatUserList from "../../components/ChatUserList";
import ChatWindow from "../../components/ChatWindow";
import DialogComponent from "../../components/DialogComponent";
import { startConversationSchema } from "../../validations/validation";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Check, Watch } from "@mui/icons-material";
import { useGetUserQuery } from "../../redux/slices/userSlice";
import { useAddConversationMutation } from "../../redux/slices/chatSlice";
import { toast } from "sonner";

const MessengerPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [openNewChat, setOpenNewChat] = useState(null);
  const {
    handleSubmit,
    reset,
    control,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      user_id: "",
    },
    resolver: yupResolver(startConversationSchema),
  });

  const [startConversation, { isLoading: isstartConversationLoading }] =
    useAddConversationMutation();

  const handleStartConversation = async (data) => {
    try {
      const response = await startConversation(data).unwrap();
      toast.success(response?.message);
      setOpenNewChat(false);
    } catch (error) {
      console.log(error?.data?.errors);
      toast.error(error?.data?.errors[0]?.detail);
    }
  };

  // Fetch users with RTK Query hook
  const { data: users, isLoading } = useGetUserQuery({
    pagination: "none",
  });
  console.log("user_id", watch("user_id"));

  return (
    <>
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
            sx={{
              height: "100%",
              width: "20%",
              borderRight: "1px solid #ddd",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* ChatUserList content */}
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              <ChatUserList
                onSelectUser={setSelectedUser}
                selectedUser={selectedUser}
              />
            </Box>

            {/* Bottom Button */}
            <Box sx={{ p: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={() => setOpenNewChat(true)}
              >
                Start New Conversation
              </Button>
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

      <DialogComponent
        open={openNewChat}
        onClose={() => {
          setOpenNewChat(false);
        }}
        onSubmit={handleSubmit(handleStartConversation)}
        title={"Start Conversation Select User"}
        icon={null}
        isLoading={isstartConversationLoading}
        submitIcon={<Check />}
        submitLabel={"Start"}
        formMethods={{ handleSubmit, reset }}
        isValid={true}
        isDirty={true}
      >
        <FormControl fullWidth error={!!errors.user_id}>
          <InputLabel id="select-user-label">Select User</InputLabel>
          <Controller
            name="user_id"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select
                {...field}
                labelId="select-user-label"
                label="Select User"
              >
                {isLoading ? (
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
                      {user.fname} {user.mi} {user.lname} {user.suffix}
                    </MenuItem>
                  ))
                )}
              </Select>
            )}
          />
          {errors.user_id && (
            <p
              style={{
                color: "#d32f2f",
                margin: "3px 14px 0",
                fontSize: "0.75rem",
              }}
            >
              {errors.user_id.message}
            </p>
          )}
        </FormControl>
      </DialogComponent>
    </>
  );
};

export default MessengerPage;
