import React, { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListItemButton from "@mui/material/ListItemButton";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LockIcon from "@mui/icons-material/Lock";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import pmpd_logo from "../assets/pmpd_logo.png";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Collapse,
  Menu,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Alert,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  AccountCircle,
  Dashboard,
  EventAvailable,
  ExpandLess,
  ExpandMore,
  Home,
  Map,
  MapsUgc,
  PersonOff,
} from "@mui/icons-material";
import LockResetIcon from "@mui/icons-material/LockReset";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import GroupIcon from "@mui/icons-material/Group";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useChangePasswordMutation } from "../redux/slices/apiSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "../validations/validation";
import DialogComponent from "../components/DialogComponent";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openModalChangePassword, setOpenModalChangePassword] = useState(false);
  const storedData = JSON.parse(localStorage.getItem("user"));
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
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

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  function cleanPointer(pointer) {
    return pointer?.replace(/^\//, ""); // Removes the leading '/'
  }

  // Handle changePassword
  const handleChangePassword = async (data) => {
    try {
      const response = await changePassword({
        ...data,
      }).unwrap();
      setOpenModalChangePassword(false);
      reset();
      setSnackbar({
        open: true,
        message: response?.message,
        severity: "success",
      });
    } catch (error) {
      error?.data?.errors.map((inputError, index) =>
        setError(cleanPointer(inputError?.source?.pointer), {
          type: "message",
          message: inputError?.detail,
        })
      );
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  let accessPermissions = storedData?.role_type;

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Handle logout functionality
  const handleLogout = () => {
    // Remove token and user from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to the homepage or login page after logout
    navigate("/");
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedUserManagement, setIsExpandedUserManagement] =
    useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleExpandUserManagement = () => {
    setIsExpandedUserManagement(!isExpandedUserManagement);
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* Left side: Menu Icon and Logo */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={[{ marginRight: 5 }, open && { display: "none" }]}
              >
                <MenuIcon sx={{ color: "secondary.main" }} />
              </IconButton>

              <Typography variant="h6" noWrap component="div">
                <img
                  src={pmpd_logo}
                  alt="Providence Memorial Park Logo"
                  style={{ width: "80px", paddingTop: "10px" }}
                />
              </Typography>
            </Box>

            {/* Right side: Avatar */}
            <Box>
              <IconButton onClick={handleAvatarClick}>
                <Avatar
                  src="https://i.pravatar.cc/150?img=3" // your avatar image here
                  alt="Profile"
                  sx={{ width: 40, height: 40 }}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Change Profile
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setOpenModalChangePassword(true), handleClose();
                  }}
                >
                  <ListItemIcon>
                    <LockIcon fontSize="small" />
                  </ListItemIcon>
                  Change Password
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setOpenModal(true), handleClose();
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={[
                  {
                    minHeight: 48,
                    px: 2.5,
                  },
                  open
                    ? {
                        justifyContent: "initial",
                      }
                    : {
                        justifyContent: "center",
                      },
                ]}
                onClick={() => handleNavigation("/admin")}
              >
                <ListItemIcon
                  sx={[
                    {
                      minWidth: 0,
                      justifyContent: "center",
                    },
                    open
                      ? {
                          mr: 2,
                        }
                      : {
                          mr: "auto",
                        },
                  ]}
                >
                  <DashboardIcon
                    sx={{
                      maxWidth: 275,
                      cursor: "pointer",
                      color: theme.palette.secondary.main,
                    }}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Dashboard"
                  sx={[
                    open
                      ? {
                          opacity: 1,
                        }
                      : {
                          opacity: 0,
                        },
                  ]}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={[
                  {
                    minHeight: 48,
                    px: 2.5,
                  },
                  open
                    ? {
                        justifyContent: "initial",
                      }
                    : {
                        justifyContent: "center",
                      },
                ]}
                onClick={() => handleNavigation("/")}
              >
                <ListItemIcon
                  sx={[
                    {
                      minWidth: 0,
                      justifyContent: "center",
                    },
                    open
                      ? {
                          mr: 2,
                        }
                      : {
                          mr: "auto",
                        },
                  ]}
                >
                  <Home
                    sx={{
                      maxWidth: 275,
                      cursor: "pointer",
                      color: theme.palette.secondary.main,
                    }}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="HomePage"
                  sx={[
                    open
                      ? {
                          opacity: 1,
                        }
                      : {
                          opacity: 0,
                        },
                  ]}
                />
              </ListItemButton>
            </ListItem>
            {accessPermissions.includes("admin") && (
              <ListItem disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  sx={[
                    {
                      minHeight: 48,
                      px: 2.5,
                    },
                    open
                      ? {
                          justifyContent: "initial",
                        }
                      : {
                          justifyContent: "center",
                        },
                  ]}
                  onClick={() => {
                    handleNavigation("/admin/masterlist");
                    toggleExpand();
                  }}
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: "center",
                      },
                      open
                        ? {
                            mr: 2,
                          }
                        : {
                            mr: "auto",
                          },
                    ]}
                  >
                    <ListAltIcon
                      sx={{
                        maxWidth: 275,
                        cursor: "pointer",
                        color: theme.palette.secondary.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Masterlist"
                    sx={[
                      open
                        ? {
                            opacity: 1,
                          }
                        : {
                            opacity: 0,
                          },
                    ]}
                  />
                  {open && (
                    <div>{isExpanded ? <ExpandLess /> : <ExpandMore />}</div>
                  )}
                </ListItemButton>
              </ListItem>
            )}
            {/* Child Items */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              {accessPermissions.includes("admin") && (
                <ListItemButton
                  sx={{
                    pl: open ? 5 : 2.5,
                  }}
                  onClick={() =>
                    handleNavigation("/admin/masterlist/cemeteries")
                  }
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: "center",
                      },
                      open
                        ? {
                            mr: 2,
                          }
                        : {
                            mr: "auto",
                          },
                    ]}
                  >
                    <Map
                      sx={{
                        maxWidth: 275,
                        cursor: "pointer",
                        color: theme.palette.secondary.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Cemetery Map"
                    sx={{
                      opacity: open ? 1 : 0,
                    }}
                  />
                </ListItemButton>
              )}{" "}
              {accessPermissions.includes("admin") && (
                <ListItemButton
                  sx={{
                    pl: open ? 5 : 2.5,
                  }}
                  onClick={() =>
                    handleNavigation("/admin/masterlist/cemetery-deceased")
                  }
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: "center",
                      },
                      open
                        ? {
                            mr: 2,
                          }
                        : {
                            mr: "auto",
                          },
                    ]}
                  >
                    <MapsUgc
                      sx={{
                        maxWidth: 275,
                        cursor: "pointer",
                        color: theme.palette.secondary.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Map Deceased"
                    sx={{
                      opacity: open ? 1 : 0,
                    }}
                  />
                </ListItemButton>
              )}
              {accessPermissions.includes("admin") && (
                <ListItemButton
                  sx={{
                    pl: open ? 5 : 2.5,
                  }}
                  onClick={() => handleNavigation("/admin/masterlist/deceased")}
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: "center",
                      },
                      open
                        ? {
                            mr: 2,
                          }
                        : {
                            mr: "auto",
                          },
                    ]}
                  >
                    <PersonOff
                      sx={{
                        maxWidth: 275,
                        cursor: "pointer",
                        color: theme.palette.secondary.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Deceased"
                    sx={{
                      opacity: open ? 1 : 0,
                    }}
                  />
                </ListItemButton>
              )}
              {accessPermissions.includes("admin") && (
                <ListItemButton
                  sx={{
                    pl: open ? 5 : 2.5,
                  }}
                  onClick={() =>
                    handleNavigation("/admin/masterlist/reservation")
                  }
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: "center",
                      },
                      open
                        ? {
                            mr: 2,
                          }
                        : {
                            mr: "auto",
                          },
                    ]}
                  >
                    <EventAvailable
                      sx={{
                        maxWidth: 275,
                        cursor: "pointer",
                        color: theme.palette.secondary.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Reservation"
                    sx={{
                      opacity: open ? 1 : 0,
                    }}
                  />
                </ListItemButton>
              )}
            </Collapse>

            {/* user management */}
            {accessPermissions.includes("admin") && (
              <ListItem disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  sx={[
                    {
                      minHeight: 48,
                      px: 2.5,
                    },
                    open
                      ? {
                          justifyContent: "initial",
                        }
                      : {
                          justifyContent: "center",
                        },
                  ]}
                  onClick={() => {
                    handleNavigation("/admin/user-management");
                    toggleExpandUserManagement();
                  }}
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: "center",
                      },
                      open
                        ? {
                            mr: 2,
                          }
                        : {
                            mr: "auto",
                          },
                    ]}
                  >
                    <AssignmentIndIcon
                      sx={{
                        maxWidth: 275,
                        cursor: "pointer",
                        color: theme.palette.secondary.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="User Management"
                    sx={[
                      open
                        ? {
                            opacity: 1,
                          }
                        : {
                            opacity: 0,
                          },
                    ]}
                  />
                  {open && (
                    <div>
                      {isExpandedUserManagement ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </div>
                  )}
                </ListItemButton>
              </ListItem>
            )}
            {/* Child Items */}
            <Collapse
              in={isExpandedUserManagement}
              timeout="auto"
              unmountOnExit
            >
              {accessPermissions.includes("admin") && (
                <ListItemButton
                  sx={{
                    pl: open ? 5 : 2.5,
                  }}
                  onClick={() =>
                    handleNavigation("/admin/user-management/user-accounts")
                  }
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: "center",
                      },
                      open
                        ? {
                            mr: 2,
                          }
                        : {
                            mr: "auto",
                          },
                    ]}
                  >
                    <GroupIcon
                      sx={{
                        maxWidth: 275,
                        cursor: "pointer",
                        color: theme.palette.secondary.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="User Accounts"
                    sx={{
                      opacity: open ? 1 : 0,
                    }}
                  />
                </ListItemButton>
              )}{" "}
            </Collapse>
          </List>
          <Divider />
          <List></List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          <Outlet />
        </Box>
      </Box>

      {/* dialog for change password  */}
      <DialogComponent
        open={openModalChangePassword}
        onClose={() => setOpenModalChangePassword(false)}
        onSubmit={handleChangePassword}
        title="Change Password"
        icon={<LockResetIcon color="secondary" />}
        isLoading={isLoading}
        submitIcon={<LogoutIcon />}
        submitLabel="Confirm"
        formMethods={{ handleSubmit, reset }}
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

      {/* dialog for logout  */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
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
            onClick={() => setOpenModal(false)}
            variant="contained"
            color="error"
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            color="success"
            fullWidth
            startIcon={<LogoutIcon />}
          >
            Log Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
