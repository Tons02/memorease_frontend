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
  TextField,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import LockResetIcon from "@mui/icons-material/LockReset";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import default_avatar from "../assets/defaultAvatar.jpg";

import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  useChangeEmailMutation,
  useChangePasswordMutation,
  useLogoutMutation,
} from "../redux/slices/apiSlice";
import pmpd_logo from "../assets/pmpd_logo.png";
import { Email, GppMaybe, Map, VerifiedUser } from "@mui/icons-material";
import DialogComponent from "../components/DialogComponent";
import {
  changePasswordSchema,
  changeEmailSchema,
} from "../validations/validation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import FloatingChat from "../components/FloatingChat";

const drawerWidth = 240;

function HomePageLayOut(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const [openLogoutDialog, setOpenLogoutDialog] = React.useState(false);
  const [anchorElMaps, setAnchorElMaps] = React.useState(null);
  const [anchorElAvatar, setAnchorElAvatar] = React.useState(null);
  const [userId, setUserId] = React.useState(null);
  const emailVerified = localStorage.getItem("email_verified");
  const [openModalChangePassword, setOpenModalChangePassword] =
    React.useState(false);
  const [openModalChangeEmail, setOpenModalChangeEmail] = React.useState(false);
  const {
    register,
    reset,
    handleSubmit,
    inputError,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      old_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
    resolver: yupResolver(changePasswordSchema),
  });

  const {
    register: registerEmail,
    handleSubmit: handleSubmitChangeEmail,
    reset: resetEmail,
    formState: { errors: emailErrors },
  } = useForm({
    defaultValues: {
      new_email: "",
    },
    resolver: yupResolver(changeEmailSchema), // ✅ Add validation
  });

  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  function cleanPointer(pointer) {
    return pointer?.replace(/^\//, ""); // Removes the leading '/'
  }

  const handleChangePassword = async (data) => {
    try {
      const response = await changePassword({
        ...data,
      }).unwrap();
      setOpenModalChangePassword(false);
      reset();
      toast.success("Password Successfully Change");
    } catch (error) {
      error?.data?.errors.map((inputError, index) =>
        setError(cleanPointer(inputError?.source?.pointer), {
          type: "message",
          message: inputError?.detail,
        })
      );
    }
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout().unwrap();
    } catch (err) {
      console.error("Logout failed", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email_verified");
    setOpenLogoutDialog(false);
    navigate("/login");
  };

  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [changeEmail, { isLoading: isChangeEmailLoading }] =
    useChangeEmailMutation();

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
  let LoginUser = JSON.parse(localStorage.getItem("user"));

  try {
    const userData = localStorage.getItem("user");

    storedData = userData ? JSON.parse(userData) : null;
    roleName = storedData?.role_type || null;
  } catch (error) {
    console.error("Invalid user data in localStorage", error);
  }
  const handleChangeEmail = async (data) => {
    console.log("userDataasdadad", storedData?.id);
    try {
      console.log("userId userId:", storedData?.id);
      const response = await changeEmail({
        id: storedData?.id,
        email: data.new_email, // ✅ Use the form data instead
      }).unwrap();

      setOpenModalChangeEmail(false);
      resetEmail(); // ✅ Reset the email form
      console.log("response email:", response);
      toast.success("Email Successfully Changed");
    } catch (error) {
      console.log("error in email", error?.data?.errors?.[0]?.detail);
      error?.data?.errors?.forEach((inputError) => {
        const field = cleanPointer(inputError?.source?.pointer);
        setError(field, {
          type: "manual",
          message: inputError?.detail,
        });
      });
      toast.error(error?.data?.errors?.[0]?.detail || "Failed to change email");
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    // { name: "About", path: "/" },
    { name: "MapsDropdown" },
    // { name: "Contact", path: "/contact" },
    !isLoggedIn ? null : { name: "Reservation", path: "/customer-reservation" },
    !isLoggedIn ? null : { name: "Deceased", path: "/customer-deceased" },
    // No more Logout here
    isLoggedIn ? null : { name: "Login", path: "/login" },
  ].filter(Boolean);

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          background: "linear-gradient(#faf7c0)",
          color: "white",
          py: 3,
          px: 2,
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src={pmpd_logo}
          alt="PMP Logo"
          style={{ width: 80, marginBottom: 8 }}
        />
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, letterSpacing: 1 }}
          color="success.main"
        >
          PMP
        </Typography>
        <Typography
          variant="caption"
          sx={{ opacity: 0.9 }}
          color="success.main"
        >
          Providence Memorial Park
        </Typography>
      </Box>

      {/* User Profile Section (if logged in) */}
      {isLoggedIn && (
        <Box
          sx={{
            px: 2,
            py: 2.5,
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={default_avatar}
              alt="User Avatar"
              sx={{
                width: 48,
                height: 48,
                border: "2px solid",
                borderColor: "success.main",
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {[
                  LoginUser?.fname,
                  LoginUser?.mi,
                  LoginUser?.lname,
                  LoginUser?.suffix,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                {roleName === "admin" ? (
                  <>
                    <VerifiedUser
                      sx={{ fontSize: 14, color: "success.main" }}
                    />
                    <Typography variant="caption" color="success.main">
                      Admin
                    </Typography>
                  </>
                ) : emailVerified ? (
                  <>
                    <VerifiedUser
                      sx={{ fontSize: 14, color: "success.main" }}
                    />
                    <Typography variant="caption" color="success.main">
                      Verified
                    </Typography>
                  </>
                ) : (
                  <>
                    <GppMaybe sx={{ fontSize: 14, color: "warning.main" }} />
                    <Typography variant="caption" color="warning.main">
                      Not Verified
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Items */}
      <List sx={{ flex: 1, py: 1 }}>
        {navItems.map((item) => {
          if (item.name === "MapsDropdown") {
            return (
              <React.Fragment key="maps-mobile">
                {isLoggedIn && !emailVerified && (
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={Link}
                      to="/verification"
                      onClick={handleDrawerToggle}
                      sx={{
                        mx: 1,
                        borderRadius: 2,
                        "&:hover": {
                          bgcolor: "success.main",
                          "& .MuiListItemText-secondary": { color: "white" },
                          "& .MuiListItemIcon-root": { color: "white" },
                        },
                      }}
                    >
                      <ListItemText
                        primary="Not Verified"
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    to="/maps"
                    onClick={handleDrawerToggle}
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "success.main",
                        "& .MuiListItemText-primary": { color: "white" },
                        "& .MuiListItemIcon-root": { color: "white" },
                      },
                    }}
                  >
                    <ListItemText
                      primary="Reservation Maps"
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    to="/maps-deceased-viewing"
                    onClick={handleDrawerToggle}
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "success.main",
                        "& .MuiListItemText-primary": { color: "white" },
                        "& .MuiListItemIcon-root": { color: "white" },
                      },
                    }}
                  >
                    <ListItemText
                      primary="Deceased Maps"
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            );
          }
          return (
            <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={handleDrawerToggle}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: "success.main",
                    "& .MuiListItemText-primary": { color: "white" },
                  },
                }}
              >
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}

        {/* Admin Menu Item */}
        {isLoggedIn && roleName === "admin" && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to="/admin"
                onClick={handleDrawerToggle}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  bgcolor: "success.main",
                  "&:hover": {
                    bgcolor: "success.main",
                    "& .MuiListItemText-primary, & .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <VerifiedUser />
                </ListItemIcon>
                <ListItemText
                  primary="Admin Panel"
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>

      {/* Account Actions (if logged in) */}
      {isLoggedIn && (
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: 1 }}>
          {roleName !== "admin" && emailVerified === false && (
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to="/verification"
                onClick={handleDrawerToggle}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  bgcolor: "warning.light",
                  "&:hover": {
                    bgcolor: "warning.main",
                    "& .MuiListItemText-primary, & .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <GppMaybe />
                </ListItemIcon>
                <ListItemText
                  primary="Verify Account"
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                setOpenModalChangeEmail(true);
                handleDrawerToggle();
              }}
              sx={{
                mx: 1,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "grey.200",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Email fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Change Email"
                primaryTypographyProps={{ fontSize: 14 }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                setOpenModalChangePassword(true);
                handleDrawerToggle();
              }}
              sx={{
                mx: 1,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "grey.200",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LockIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Change Password"
                primaryTypographyProps={{ fontSize: 14 }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                setOpenLogoutDialog(true);
                handleDrawerToggle();
              }}
              sx={{
                mx: 1,
                borderRadius: 2,
                bgcolor: "error.light",
                "&:hover": {
                  bgcolor: "error.main",
                  "& .MuiListItemText-primary, & .MuiListItemIcon-root": {
                    color: "white",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
              />
            </ListItemButton>
          </ListItem>
        </Box>
      )}
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
            <MenuIcon color="secondary" />
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
                    src={default_avatar}
                    alt="Providence Memorial Park Logo"
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
                  <MenuItem>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    {[
                      LoginUser.fname,
                      LoginUser.mi,
                      LoginUser.lname,
                      LoginUser.suffix,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </MenuItem>
                  {roleName !== "admin" && (
                    <>
                      {emailVerified !== null &&
                        (emailVerified ? (
                          <MenuItem
                            onClick={handleAvatarClose}
                            component={Link}
                          >
                            <ListItem disablePadding>
                              <ListItemIcon>
                                <VerifiedUser fontSize="small" />
                              </ListItemIcon>
                              Verified
                            </ListItem>
                          </MenuItem>
                        ) : (
                          <MenuItem
                            onClick={handleAvatarClose}
                            component={Link}
                            to="/verification"
                          >
                            <ListItem disablePadding>
                              <ListItemIcon>
                                <GppMaybe fontSize="small" />
                              </ListItemIcon>
                              Not Verified
                            </ListItem>
                          </MenuItem>
                        ))}
                    </>
                  )}

                  {/* <MenuItem onClick={handleAvatarClose}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Change Profile
                  </MenuItem> */}
                  <MenuItem
                    onClick={() => {
                      setOpenModalChangeEmail(true);
                      handleAvatarClose();
                    }}
                  >
                    <ListItemIcon>
                      <Email fontSize="small" />
                    </ListItemIcon>
                    Change Email
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
        {location.pathname !== "/contact" && <FloatingChat />}
        <Outlet />
      </Box>

      {/* change password  */}
      <DialogComponent
        open={openModalChangePassword}
        onClose={() => setOpenModalChangePassword(false)}
        onSubmit={handleChangePassword}
        title="Change Password"
        icon={<LockResetIcon color="secondary" />}
        isLoading={isLoading}
        submitIcon={<LogoutIcon />}
        submitLabel="Confirm"
        formMethods={{ handleSubmit }}
      >
        <Divider />
        <TextField
          {...register("old_password")}
          label="Old Password"
          margin="dense"
          type="password"
          fullWidth
          error={!!errors.old_password}
          helperText={errors.old_password?.message}
        />
        <TextField
          {...register("new_password")}
          label="New Password"
          type="password"
          margin="dense"
          fullWidth
          error={!!errors.new_password}
          helperText={errors.new_password?.message}
        />
        <TextField
          {...register("new_password_confirmation")}
          label="Confirm New Password"
          margin="dense"
          type="password"
          fullWidth
          error={!!errors.new_password_confirmation}
          helperText={errors.new_password_confirmation?.message}
        />
      </DialogComponent>

      {/* change email  */}
      <DialogComponent
        open={openModalChangeEmail}
        onClose={() => {
          setOpenModalChangeEmail(false);
          resetEmail(); // ✅ Reset form on close
        }}
        onSubmit={handleSubmitChangeEmail(handleChangeEmail)}
        title="Change Email"
        icon={<Email color="secondary" />}
        isLoading={isChangeEmailLoading}
        submitIcon={<Email />} // ✅ Changed icon
        submitLabel="Confirm"
        formMethods={{ handleSubmit: handleSubmitChangeEmail }}
      >
        <TextField
          {...registerEmail("new_email")} // ✅ Register with react-hook-form
          required
          label="New Email"
          margin="dense"
          type="email"
          fullWidth
          error={!!emailErrors.new_email} // ✅ Use correct error object
          helperText={emailErrors.new_email?.message} // ✅ Use correct error object
        />
      </DialogComponent>

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
            Logout
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
