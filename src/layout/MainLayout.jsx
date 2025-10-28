import React, { useEffect, useState } from "react";
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
import default_avatar from "../assets/defaultAvatar.jpg";
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
  Badge,
  colors,
} from "@mui/material";
import {
  AccountCircle,
  AdminPanelSettingsTwoTone,
  Dashboard,
  Email,
  EventAvailable,
  ExpandLess,
  ExpandMore,
  Home,
  House,
  Map,
  MapsUgc,
  MessageRounded,
  PersonOff,
} from "@mui/icons-material";
import { useGetConversationCountsQuery } from "../redux/slices/chatSlice";
import LockResetIcon from "@mui/icons-material/LockReset";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import GroupIcon from "@mui/icons-material/Group";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import {
  useChangeEmailMutation,
  useChangePasswordMutation,
} from "../redux/slices/apiSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  changeEmailSchema,
  changePasswordSchema,
} from "../validations/validation";
import DialogComponent from "../components/DialogComponent";
import ChatPopup from "../pages/ChatMessage/ChatPopup";
import GavelIcon from "@mui/icons-material/Gavel";
import { toast } from "sonner";

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
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModalChangePassword, setOpenModalChangePassword] = useState(false);
  const storedData = JSON.parse(localStorage.getItem("user"));
  const [anchorEl, setAnchorEl] = useState(null);

  const [openModalChangeEmail, setOpenModalChangeEmail] = React.useState(false);
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

  const {
    register: registerEmail,
    handleSubmit: handleSubmitChangeEmail,
    reset: resetEmail,
    formState: { errors: emailErrors },
  } = useForm({
    defaultValues: {
      new_email: "",
    },
    resolver: yupResolver(changeEmailSchema),
  });

  const [changeEmail, { isLoading: isChangeEmailLoading }] =
    useChangeEmailMutation();
  const LoginUserCount = JSON.parse(localStorage.getItem("user"));
  const { data: conversationCounts, refetch: conversationCountsRefetch } =
    useGetConversationCountsQuery();
  // Real-time listener for new messages
  useEffect(() => {
    if (!LoginUserCount?.id) return;

    const channel = window.Echo.private(`user.${LoginUserCount.id}`);

    channel.listen(".message.sent", (e) => {
      console.log("New message received", e.message);
      conversationCountsRefetch?.();
    });

    return () => {
      window.Echo.leave(`user.${LoginUserCount.id}`);
    };
  }, [LoginUserCount?.id]);

  // Real-time listener for new messages
  useEffect(() => {
    if (!LoginUser?.id) return;

    const channel = window.Echo.private(`user.${LoginUser.id}`);

    channel.listen(".message.sent", (e) => {
      console.log("New message received", e.message);
      conversationRefetch?.();
      if (e.message.conversation_id === selectedUser?.conversationId) {
        messageRefetch?.();
      }
    });
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

  const handleChangeEmail = async (data) => {
    try {
      console.log("userId userId:", LoginUser.id);
      const response = await changeEmail({
        id: LoginUser.id,
        email: data.new_email, // ✅ Use the form data instead
      }).unwrap();

      setOpenModalChangeEmail(false);
      resetEmail(); // ✅ Reset the email form
      console.log("response email:", response);
      toast.success("Email Successfully Changed");
    } catch (error) {
      console.log("error in email", error);
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

  const handleClose = () => {
    setAnchorEl(null);
  };

  let accessPermissions = storedData?.role_type;
  let LoginUser = JSON.parse(localStorage.getItem("user"));

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
    localStorage.removeItem("email_verified");

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
                sx={{
                  marginRight: 5,
                  display: open ? "none" : "block",
                }}
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
                  src={default_avatar}
                  alt="Providence Memorial Park Logo"
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
                {" "}
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
                <MenuItem onClick={() => handleNavigation("/")}>
                  <ListItemIcon>
                    <House fontSize="small" />
                  </ListItemIcon>
                  Homepage
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setOpenModalChangeEmail(true);
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <Email fontSize="small" />
                  </ListItemIcon>
                  Change Email
                </MenuItem>
                {/* <MenuItem>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Change Profile
                </MenuItem> */}
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
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            "& .MuiDrawer-paper": {
              background: theme.palette.grey[100],
              borderRight: "1px solid #b0b0b0ff",
              boxShadow: open ? "4px 0 10px rgba(199, 193, 193, 0.05)" : "none",
              transition: "all 0.3s ease",
            },
          }}
        >
          <Toolbar sx={{ justifyContent: "center" }}>
            {open && (
              <Typography
                variant="h6"
                onClick={open ? handleDrawerClose : handleDrawerOpen}
                sx={{
                  fontWeight: 700,
                  letterSpacing: 1,
                  cursor: "pointer",
                  color: "#15803d", // your primary color
                  transition: "0.3s",
                  "&:hover": {
                    color: "#0f5e2d",
                    transform: "scale(1.05)",
                    textDecoration: "underline",
                  },
                }}
              >
                ADMIN
              </Typography>
            )}
            <DrawerHeader>
              <IconButton onClick={open ? handleDrawerClose : handleDrawerOpen}>
                {open ? (
                  ""
                ) : (
                  <AdminPanelSettingsTwoTone sx={{ color: "#15803d" }} />
                )}
              </IconButton>
            </DrawerHeader>
          </Toolbar>
          <Divider />
          <List>
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
            )}
            {/* {accessPermissions.includes("admin") && (
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
            )} */}
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
              {accessPermissions.includes("admin") && (
                <ListItemButton
                  sx={{
                    pl: open ? 5 : 2.5,
                  }}
                  onClick={() => handleNavigation("/admin/masterlist/terms")}
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
                    <GavelIcon
                      sx={{
                        maxWidth: 275,
                        cursor: "pointer",
                        color: theme.palette.secondary.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Terms"
                    sx={{
                      opacity: open ? 1 : 0,
                    }}
                  />
                </ListItemButton>
              )}
            </Collapse>
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
                </ListItemButton>
              </ListItem>
            )}
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
                  onClick={() => handleNavigation("/admin/messages")}
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
                    {/* 👇 Wrap icon in Badge when sidebar is closed */}
                    <Badge
                      badgeContent={
                        conversationCounts?.data?.updated_count || 0
                      }
                      color="error"
                    >
                      <MessageRounded
                        sx={{
                          maxWidth: 275,
                          cursor: "pointer",
                          color: theme.palette.secondary.main,
                        }}
                      />
                    </Badge>
                  </ListItemIcon>

                  {/* 👇 Show count inline when sidebar is open */}
                  <ListItemText
                    primary={`Messages`}
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
            )}
          </List>
          <Divider />
          <List></List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "#f9fafb",
            minHeight: "100vh",
          }}
        >
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

      {/* change email  */}
      <DialogComponent
        open={openModalChangeEmail}
        onClose={() => {
          setOpenModalChangeEmail(false);
          resetEmail();
        }}
        onSubmit={handleSubmitChangeEmail(handleChangeEmail)}
        title="Change Email"
        icon={<Email color="secondary" />}
        isLoading={isChangeEmailLoading}
        submitIcon={<Email />}
        submitLabel="Confirm"
        formMethods={{ handleSubmit: handleSubmitChangeEmail }}
      >
        <TextField
          {...registerEmail("new_email")}
          required
          label="New Email"
          margin="dense"
          type="email"
          fullWidth
          error={!!emailErrors.new_email}
          helperText={emailErrors.new_email?.message}
        />
      </DialogComponent>

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
