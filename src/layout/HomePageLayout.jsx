import * as React from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Avatar,
  ListItemIcon,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";

import { Outlet, Link, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../redux/slices/apiSlice";
import pmpd_logo from "../assets/pmpd_logo.png";
import { VerifiedUser } from "@mui/icons-material";

const drawerWidth = 240;

function HomePageLayOut(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = React.useState(false);
  const [anchorElMaps, setAnchorElMaps] = React.useState(null);
  const [anchorElAvatar, setAnchorElAvatar] = React.useState(null);
  const [openModalChangePassword, setOpenModalChangePassword] =
    React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);

  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const handleLogoutConfirm = async () => {
    try {
      await logout().unwrap();
    } catch (err) {
      console.error("Logout failed", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpenLogoutDialog(false);
    navigate("/login");
  };

  const handleMapsClick = (event) => {
    setAnchorElMaps(event.currentTarget);
  };
  const handleMapsClose = () => {
    setAnchorElMaps(null);
  };

  const handleAvatarClick = (event) => {
    setAnchorElAvatar(event.currentTarget);
  };
  const handleAvatarClose = () => {
    setAnchorElAvatar(null);
  };

  const isLoggedIn = !!localStorage.getItem("token");
  let storedData = null;
  let roleName = null;

  try {
    const userData = localStorage.getItem("user");
    storedData = userData ? JSON.parse(userData) : null;
    roleName = storedData?.role_type || null;
  } catch (error) {
    console.error("Invalid user data in localStorage", error);
  }

  const navItems = [
    { name: "Home", path: "/" },
    { name: "MapsDropdown" },
    { name: "Contact", path: "/contact" },
    !isLoggedIn ? null : { name: "Reservation", path: "/customer-reservation" },
    // No more Logout here
    isLoggedIn ? null : { name: "Login", path: "/login" },
  ].filter(Boolean);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        MUI
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => {
          if (item.name === "MapsDropdown") {
            return (
              <React.Fragment key="maps-mobile">
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/maps">
                    <ListItemText primary="Reservation Maps" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/maps-deceased-viewing">
                    <ListItemText primary="Deceased Maps" />
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            );
          }
          return (
            <ListItem key={item.name} disablePadding>
              <ListItemButton component={Link} to={item.path}>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            <img
              src={pmpd_logo}
              alt="Providence Memorial Park Logo"
              style={{ width: 100, marginBottom: 0 }}
            />
          </Typography>

          {/* Right side navigation (desktop) */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 2,
            }}
          >
            {navItems.map((item) => {
              if (item.name === "MapsDropdown") {
                return (
                  <React.Fragment key="maps-desktop">
                    <Button color="secondary" onClick={handleMapsClick}>
                      Maps
                    </Button>
                    <Menu
                      anchorEl={anchorElMaps}
                      open={Boolean(anchorElMaps)}
                      onClose={handleMapsClose}
                    >
                      <MenuItem
                        component={Link}
                        to="/maps"
                        onClick={handleMapsClose}
                      >
                        Reservation Maps
                      </MenuItem>
                      <MenuItem
                        component={Link}
                        to="/maps-deceased-viewing"
                        onClick={handleMapsClose}
                      >
                        Deceased Maps
                      </MenuItem>
                    </Menu>
                  </React.Fragment>
                );
              }

              return (
                <Button
                  key={item.name}
                  color="secondary"
                  component={Link}
                  to={item.path}
                >
                  {item.name}
                </Button>
              );
            })}

            {isLoggedIn && (
              <Box>
                <IconButton onClick={handleAvatarClick}>
                  <Avatar
                    src="https://i.pravatar.cc/150?img=3"
                    alt="Profile"
                    sx={{ width: 40, height: 40 }}
                  />
                </IconButton>
                <Menu
                  anchorEl={anchorElAvatar}
                  open={Boolean(anchorElAvatar)}
                  onClose={handleAvatarClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  {roleName === "admin" && (
                    <MenuItem
                      onClick={handleAvatarClose}
                      component={Link}
                      to="/admin"
                    >
                      <ListItemIcon>
                        <VerifiedUser fontSize="small" />
                      </ListItemIcon>
                      Admin
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleAvatarClose}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Change Profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setOpenModalChangePassword(true);
                      handleAvatarClose();
                    }}
                  >
                    <ListItemIcon>
                      <LockIcon fontSize="small" />
                    </ListItemIcon>
                    Change Password
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setOpenLogoutDialog(true);
                      handleAvatarClose();
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>

      <Box component="main" sx={{ flexGrow: 1, width: "100%" }}>
        <Toolbar />
        <Outlet />
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningAmberRoundedIcon color="warning" />
            <Typography variant="h6" fontWeight="bold">
              Confirm Logout
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Are you sure you want to log out?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            If you log out, you will need to log in again to access your
            account.
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenLogoutDialog(false)}
            variant="contained"
            color="error"
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="success"
            fullWidth
            startIcon={<LogoutIcon />}
          >
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

HomePageLayOut.propTypes = {
  window: PropTypes.func,
};

export default HomePageLayOut;
