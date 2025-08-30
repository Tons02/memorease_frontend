import { Box, Breadcrumbs, Typography } from "@mui/material";
import React from "react";
import Link from "@mui/material/Link";
import Card from "../components/Card";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { Dashboard, EventAvailable } from "@mui/icons-material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import GavelIcon from "@mui/icons-material/Gavel";

const Masterlist = () => {
  const storedData = JSON.parse(localStorage.getItem("user"));

  let accessPermissions = storedData?.role_type;

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
        {accessPermissions.includes("admin") && (
          <Card
            destination="cemeteries"
            icon={<ApartmentIcon />}
            title="Cemetery Mapping"
            subtitle="Manage cemetery map and lot information "
          />
        )}
        {accessPermissions.includes("admin") && (
          <Card
            destination="cemetery-deceased"
            icon={<ApartmentIcon />}
            title="Cemetery Deceased"
            subtitle="View and navigate cemetery map of deceased"
          />
        )}
        {accessPermissions.includes("admin") && (
          <Card
            destination="deceased"
            icon={<PersonOffIcon />}
            title="Deceased"
            subtitle="Manage cemetery deceased records and information "
          />
        )}{" "}
        {accessPermissions.includes("admin") && (
          <Card
            destination="reservation"
            icon={<EventAvailable />}
            title="Reservation"
            subtitle="Manage cemetery reservation records and information "
          />
        )}
        {accessPermissions.includes("admin") && (
          <Card
            destination="terms"
            icon={<GavelIcon />}
            title="Terms and agreement"
            subtitle="Manage cemetery terms and agreement information "
          />
        )}
      </Box>
    </>
  );
};

export default Masterlist;
