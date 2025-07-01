import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { Outlet, Link, useNavigate } from "react-router-dom";
import pmpd_logo from "../assets/pmpd_logo.png";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LogoutIcon from "@mui/icons-material/Logout";

// Import the logout mutation
import { useLogoutMutation } from "../redux/slices/apiSlice";
import { DialogContent } from "@mui/material";

const drawerWidth = 240;

function HomePageLayOut(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = React.useState(false);
  const navigate = useNavigate();

  const [logout] = useLogoutMutation(); // Redux Toolkit mutation

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
  };

  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout().unwrap(); // Call the API
    } catch (err) {
      console.error("Logout failed", err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpenLogoutDialog(false);
    navigate("/login");
  };

  const isLoggedIn = !!localStorage.getItem("token");

  let storedData = null;
  let roleName = null;

  try {
    const userData = localStorage.getItem("user");
    storedData = userData ? JSON.parse(userData) : null;
    roleName = storedData?.role?.name || null;
  } catch (error) {
    console.error("Invalid user data in localStorage", error);
  }

  console.log("roleName:", roleName);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Maps", path: "/maps" },
    { name: "Contact", path: "/contact" },
    roleName === "admin" && { name: "Admin", path: "/admin" },
    isLoggedIn
      ? { name: "Logout", path: "" }
      : { name: "Login", path: "/login" },
  ].filter(Boolean);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        MUI
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component={item.name === "Logout" ? "button" : Link}
              to={item.name === "Logout" ? undefined : item.path}
              onClick={item.name === "Logout" ? handleLogoutClick : undefined}
              sx={{ textAlign: "center" }}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
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
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navItems.map((item) => (
              <Button
                key={item.name}
                color="secondary"
                component={item.name === "Logout" ? "button" : Link}
                to={item.name === "Logout" ? undefined : item.path}
                onClick={item.name === "Logout" ? handleLogoutClick : undefined}
              >
                {item.name}
              </Button>
            ))}
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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Logout Confirmation Modal */}
      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
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
            onClick={handleLogoutCancel}
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
