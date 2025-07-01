import { Box, Breadcrumbs, Typography } from "@mui/material";
import React from "react";
import Link from "@mui/material/Link";
import Card from "../components/Card";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import BallotIcon from "@mui/icons-material/Ballot";
import ViewHeadlineIcon from "@mui/icons-material/ViewHeadline";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import { Dashboard } from "@mui/icons-material";
import ListAltIcon from "@mui/icons-material/ListAlt";

const Masterlist = () => {
  const storedData = JSON.parse(localStorage.getItem("user"));

  let accessPermissions = storedData?.role?.access_permission;

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 1 }}>
        <Link
          underline="hover"
          sx={{ display: "flex", alignItems: "center" }}
          color="inherit"
          href="/"
        >
          <Dashboard sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography
          sx={{ color: "text.primary", display: "flex", alignItems: "center" }}
        >
          <ListAltIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Masterlist
        </Typography>
      </Breadcrumbs>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Masterlist
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2, // Optional: spacing between items
          justifyContent: "center", // Adjust alignment
        }}
      >
        {accessPermissions.includes("cemeteries") && (
          <Card
            destination="cemeteries"
            icon={<ApartmentIcon />}
            title="Cemetery"
            subtitle="Manage cemetery records and information "
          />
        )}
      </Box>
    </>
  );
};

export default Masterlist;
