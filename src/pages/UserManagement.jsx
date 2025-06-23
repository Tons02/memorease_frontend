import { Box, Breadcrumbs, Typography } from "@mui/material";
import React from "react";
import Link from "@mui/material/Link";
import Card from "../components/Card";
import GroupIcon from "@mui/icons-material/Group";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { Dashboard } from "@mui/icons-material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

const UserManagement = () => {
  const storedData = JSON.parse(localStorage.getItem("user"));

  let accessPermissions = storedData?.role?.access_permission;

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
        {accessPermissions.includes("user") && (
          <Card
            destination="user-accounts"
            icon={<GroupIcon />}
            title="Users"
            subtitle="User registration and access control"
          />
        )}
        {accessPermissions.includes("role") && (
          <Card
            destination="role-management"
            icon={<ManageAccountsIcon />}
            title="Role Management"
            subtitle="Used for adding roles and permissions to users"
          />
        )}
      </Box>
    </>
  );
};

export default UserManagement;
