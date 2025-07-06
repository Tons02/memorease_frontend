import { Box, Breadcrumbs, Typography } from "@mui/material";
import React from "react";
import Link from "@mui/material/Link";
import Card from "../components/Card";
import GroupIcon from "@mui/icons-material/Group";
import { Dashboard } from "@mui/icons-material";

const UserManagement = () => {
  const storedData = JSON.parse(localStorage.getItem("user"));

  let accessPermissions = storedData?.role_type;

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 1 }}>
        <Link
          underline="hover"
          sx={{ display: "flex", alignItems: "center" }}
          color="inherit"
          href="/admin"
        >
          <Dashboard sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography
          sx={{ color: "text.primary", display: "flex", alignItems: "center" }}
        >
          <GroupIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          User Management
        </Typography>
      </Breadcrumbs>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2, // Optional: spacing between items
          justifyContent: "center", // Adjust alignment
        }}
      >
        {accessPermissions.includes("admin") && (
          <Card
            destination="user-accounts"
            icon={<GroupIcon />}
            title="Users"
            subtitle="User registration and access control"
          />
        )}
      </Box>
    </>
  );
};

export default UserManagement;
