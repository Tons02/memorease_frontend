import {
  CalendarMonth,
  CalendarMonthRounded,
  Check,
  Dashboard,
  Female,
  Male,
  SupervisedUserCircle,
  VerifiedUser,
  Add,
  Close,
} from "@mui/icons-material";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
  Avatar,
  Tooltip,
} from "@mui/material";
import { UserSchema } from "../validations/validation";
import React, { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import Link from "@mui/material/Link";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  useAddUserMutation,
  useArchivedUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
} from "../redux/slices/userSlice";
import { toast } from "sonner";
import CloseIcon from "@mui/icons-material/Close";
import DialogComponent from "../components/DialogComponent";

const User = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [localSearch, setLocalSearch] = useState("");
  const [activeMenuRow, setActiveMenuRow] = useState(null);
  const [edit, setEdit] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedID, setSelectedID] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [restoreUser, setRestoreUser] = useState(false);

  const formMethods = useForm({
    defaultValues: {
      fname: "",
      mi: "",
      lname: "",
      suffix: "",
      gender: "",
      mobile_number: "",
      birthday: "",
      address: "",
      username: "",
      email: "",
      role_id: null,
    },
    resolver: yupResolver(UserSchema),
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setError,
    watch,
  } = formMethods;

  // Fetch users with RTK Query hook
  const {
    data: role,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserQuery({
    search,
    page: page + 1,
    per_page: rowsPerPage,
    status,
  });

  console.log(role?.data?.total);

  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [archiveUser, { isLoading: isArchiving }] = useArchivedUserMutation();

  // Handle Create User
  const handleCreateUser = async (data) => {
    const formattedData = {
      ...data,
      birthday: dayjs(data.birthday).format("DD-MM-YYYY"),
    };

    try {
      const response = await addUser(formattedData).unwrap();
      console.log("User created:", response);
      setOpenDialog(false);
      refetch();
      reset();
      toast.success(response?.message);
    } catch (error) {
      console.log(error?.data?.errors);
      if (error?.data?.errors) {
        error.data.errors.forEach((e) => {
          const pointer = e.source?.pointer || "";
          const key = pointer.split("/").pop();
          setError(key, { type: "server", message: e.detail });
        });
      }
      toast.error(error?.data?.errors[0]?.detail);
    }
  };

  // Handle Update User
  const handleUpdateUser = async (data) => {
    const formattedData = {
      ...data,
      birthday: dayjs(data.birthday).format("DD-MM-YYYY"),
    };

    console.log("formatted Data", formattedData);
    try {
      const response = await updateUser({
        ...formattedData,
        id: selectedID,
      }).unwrap();
      console.log("user updated:", response);
      refetch();
      setOpenDialog(false);
      setEdit(false);
      toast.success(response?.message);
    } catch (error) {
      console.log(error?.data?.errors[0]?.detail);
      if (error?.data?.errors) {
        error.data.errors.forEach((e) => {
          const pointer = e.source?.pointer || "";
          const key = pointer.split("/").pop();
          setError(key, { type: "server", message: e.detail });
        });
      }
      toast.error(error?.data?.errors[0]?.detail);
    }
  };

  const handleEdit = (row) => {
    dayjs.extend(customParseFormat);
    setSelectedID(row.id);
    if (row) {
      const formattedUser = {
        ...row,
        birthday: dayjs(row.birthday, "DD-MM-YYYY").format("YYYY-MM-DD"),
      };
      reset(formattedUser);
      console.log(watch());
    }
    setEdit(true);
    setOpenDialog(true);
  };

  // Handle Delete/Archive User
  const handleDeleteUser = async () => {
    try {
      const response = await archiveUser({ id: selectedID }).unwrap();
      console.log("User archived:", response);
      setOpenDeleteDialog(false);
      refetch();
      toast.success(response?.message);
    } catch (errors) {
      console.error("Error archiving user:", errors?.data?.errors[0]?.title);
      toast.error(errors?.data?.errors[0]?.title);
    }
  };

  const handleChangeStatus = (event) => {
    if (event.target.checked) {
      setStatus("inactive");
      refetch();
    } else {
      setStatus("active");
      refetch();
    }
  };

  const handleDeleteClick = (row) => {
    setSelectedID(row.id);
    setOpenDeleteDialog(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClickDrowpDown = (event, row) => {
    setActiveMenuRow(row.id);
    setAnchorEl(event.currentTarget);
  };
  const handleCloseDropDown = () => {
    setAnchorEl(null);
  };

  const handleCreate = () => {
    reset({
      fname: "",
      mi: "",
      lname: "",
      suffix: "",
      gender: "",
      mobile_number: "",
      birthday: "",
      address: "",
      username: "",
      email: "",
      role_id: null,
    });
    setOpenDialog(true);
  };

  const handleClose = () => {
    reset({
      fname: "",
      mi: "",
      lname: "",
      suffix: "",
      gender: "",
      mobile_number: "",
      birthday: "",
      address: "",
      username: "",
      email: "",
      role_id: null,
    });
    setOpenDialog(false);
    setEdit(false);
    setRestoreUser(false);
    setOpenDeleteDialog(false);
  };

  const getInitials = (fname, lname) => {
    return `${fname?.charAt(0) || ""}${lname?.charAt(0) || ""}`.toUpperCase();
  };

  const getStatusChip = (deleted_at) => {
    if (deleted_at === null) {
      return (
        <Chip
          label="Active"
          color="success"
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      );
    } else {
      return (
        <Chip
          label="Inactive"
          color="error"
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      );
    }
  };

  const getRoleChip = (role) => {
    const roleColors = {
      admin: "secondary",
      customer: "secondary",
    };
    return (
      <Chip
        label={role?.charAt(0).toUpperCase() + role?.slice(1)}
        color={roleColors[role] || "default"}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 500 }}
      />
    );
  };

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
          <AssignmentIndIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          User Management
        </Typography>
      </Breadcrumbs>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" sx={{ mr: 2, fontWeight: 600 }}>
          User Management
        </Typography>
        <Button
          size="medium"
          variant="contained"
          onClick={handleCreate}
          color="success"
          startIcon={<Add />}
          sx={{
            mt: 1,
            borderRadius: "10px",
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          Add User
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
          maxHeight: 550,
          minHeight: 450,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Enhanced Header section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            padding: 2,
            backgroundColor: "#fafafa",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                color="success"
                checked={status === "inactive"}
                onChange={handleChangeStatus}
                sx={{
                  "&.Mui-checked": {
                    color: "#10b981",
                  },
                }}
              />
            }
            label="Show Archived"
            sx={{
              backgroundColor:
                status === "inactive" ? "#f0fdf4" : "transparent",
              borderRadius: "8px",
              padding: "4px 8px",
              margin: 0,
            }}
          />

          <TextField
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <SearchIcon sx={{ fontSize: 18 }} />
                Search
              </Box>
            }
            variant="outlined"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(e.target.value);
              }
            }}
            sx={{
              width: 280,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                height: 48,
                backgroundColor: "#ffffff",
                transition: "all 0.2s ease",
                "& fieldset": {
                  borderColor: "#d1d5db",
                },
                "&:hover fieldset": {
                  borderColor: "#6b7280",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1E6F2A",
                  borderWidth: "2px",
                },
              },
            }}
          />
        </Box>

        {/* Enhanced Table section */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Table
            sx={{
              minWidth: 650,
              "& .MuiTableHead-root": {
                position: "sticky",
                top: 0,
                zIndex: 1,
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  background:
                    "linear-gradient(135deg, #1E6F2A 0%, #66cc59ff 100%)",
                  "& .MuiTableCell-head": {
                    background: "transparent",
                    fontWeight: 700,
                    color: "#ffffff",
                    borderBottom: "none",
                    borderRight: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "0.700rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    "&:last-child": {
                      borderRight: "none",
                    },
                  },
                }}
              >
                <TableCell>ID</TableCell>
                <TableCell align="center">Profile</TableCell>
                <TableCell align="center">Full Name</TableCell>
                <TableCell align="center">Gender</TableCell>
                <TableCell align="center">Contact</TableCell>
                <TableCell align="center">Birthday</TableCell>
                <TableCell align="center">Address</TableCell>
                <TableCell align="center">Username</TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell align="center">Role</TableCell>
                <TableCell align="center">Created At</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {Array.from({ length: 13 }).map((col, index) => (
                      <TableCell
                        key={index}
                        align="center"
                        sx={{
                          borderBottom: "1px solid #e5e7eb",
                          borderRight: "1px solid #f3f4f6",
                          padding: "16px",
                          "&:last-child": {
                            borderRight: "none",
                          },
                        }}
                      >
                        <Skeleton
                          width="80%"
                          height={24}
                          sx={{ borderRadius: "4px" }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    align="center"
                    sx={{
                      padding: "60px 16px",
                      color: "#ef4444",
                      fontWeight: 500,
                      backgroundColor: "#fef2f2",
                    }}
                  >
                    ⚠️ Error: {error?.message}
                  </TableCell>
                </TableRow>
              ) : role?.data?.data?.length > 0 ? (
                role?.data?.data?.map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        "& .MuiTableCell-root": {
                          borderColor: "#e2e8f0",
                        },
                      },
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                  >
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      {row.id}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor:
                            row.gender === "male" ? "#3b82f6" : "#ec4899",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          margin: "0 auto",
                        }}
                      >
                        {getInitials(row.fname, row.lname)}
                      </Avatar>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {`${row.fname} ${row.mi ? row.mi + "." : ""} ${
                            row.lname
                          }`}
                        </Typography>
                        {row.suffix && (
                          <Typography variant="caption" color="text.secondary">
                            {row.suffix}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        {row.gender === "male" ? (
                          <Male sx={{ fontSize: 16, color: "#3b82f6" }} />
                        ) : (
                          <Female sx={{ fontSize: 16, color: "#ec4899" }} />
                        )}
                        {row.gender?.charAt(0).toUpperCase() +
                          row.gender?.slice(1)}
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      {row.mobile_number}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      {row.birthday}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                        maxWidth: "200px",
                      }}
                    >
                      <Tooltip title={row.address} arrow>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.address}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      {row.username}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      {row.email}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                      }}
                    >
                      {getRoleChip(row.role_type)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      {dayjs(row.created_at).format("MMM DD, YYYY")}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                      }}
                    >
                      {getStatusChip(row.deleted_at)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        padding: "16px",
                        minWidth: "120px",
                      }}
                    >
                      <Tooltip title="More actions" arrow>
                        <IconButton
                          onClick={(event) => handleClickDrowpDown(event, row)}
                          sx={{
                            "&:hover": {
                              backgroundColor: "#e5e7eb",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>

                      <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={activeMenuRow === row.id && open}
                        onClose={handleCloseDropDown}
                        MenuListProps={{
                          "aria-labelledby": "basic-button",
                        }}
                        PaperProps={{
                          sx: {
                            borderRadius: "8px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                            border: "1px solid #e5e7eb",
                          },
                        }}
                      >
                        {status === "active" ? (
                          <>
                            <MenuItem
                              onClick={() => {
                                handleCloseDropDown();
                                handleEdit(row);
                              }}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "#f3f4f6",
                                },
                                fontSize: "0.875rem",
                              }}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                handleCloseDropDown();
                                handleDeleteClick(row);
                              }}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "#fef2f2",
                                  color: "#dc2626",
                                },
                                fontSize: "0.875rem",
                              }}
                            >
                              Archive
                            </MenuItem>
                          </>
                        ) : (
                          <MenuItem
                            onClick={() => {
                              handleCloseDropDown();
                              handleDeleteClick(row);
                              setRestoreUser(true);
                            }}
                            sx={{
                              "&:hover": {
                                backgroundColor: "#f0fdf4",
                                color: "#16a34a",
                              },
                              fontSize: "0.875rem",
                            }}
                          >
                            Restore
                          </MenuItem>
                        )}
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    align="center"
                    sx={{
                      padding: "60px 16px",
                      color: "#6b7280",
                      fontStyle: "italic",
                      backgroundColor: "#f9fafb",
                      fontSize: "1rem",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          fontSize: "3rem",
                          opacity: 0.3,
                        }}
                      >
                        👥
                      </Box>
                      <Box>No Users Found</Box>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        {/* Enhanced Pagination */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#fafafa",
            "& .MuiTablePagination-root": {
              overflow: "visible",
            },
            "& .MuiTablePagination-toolbar": {
              minHeight: "52px",
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontSize: "0.875rem",
                color: "#6b7280",
                fontWeight: 500,
              },
            "& .MuiIconButton-root": {
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#e5e7eb",
              },
            },
          }}
        >
          <Box
            sx={{
              fontSize: "0.875rem",
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            Showing{" "}
            {Math.min(page * rowsPerPage + 1, role?.data?.data?.length || 0)} -{" "}
            {Math.min((page + 1) * rowsPerPage, role?.data?.data?.length || 0)}{" "}
            of {role?.data?.data?.length || 0} entries
          </Box>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={role?.data?.total || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              "& .MuiSelect-select": {
                borderRadius: "6px",
                fontSize: "0.875rem",
              },
            }}
          />
        </Box>
      </TableContainer>

      {/* Create/Edit User Dialog using DialogComponent */}
      <DialogComponent
        open={openDialog}
        onClose={handleClose}
        onSubmit={edit ? handleUpdateUser : handleCreateUser}
        title={edit ? "Update User" : "Create New User"}
        icon={edit ? <Check /> : <Add />}
        isLoading={isAdding || isUpdating}
        submitLabel={edit ? "Update User" : "Create User"}
        submitIcon={<Check />}
        maxWidth="md"
        formMethods={formMethods}
        isValid={isValid}
        isDirty={isDirty}
      >
        <Box
          display="grid"
          gridTemplateColumns="1fr 1fr"
          gap={2}
          sx={{ mt: 1 }}
        >
          <TextField
            {...register("fname")}
            label="First Name"
            fullWidth
            error={!!errors.fname}
            helperText={errors.fname?.message}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "white",
              },
            }}
          />
          <TextField
            {...register("mi")}
            label="Middle Initial"
            fullWidth
            error={!!errors.mi}
            helperText={errors.mi?.message}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "white",
              },
            }}
          />
          <TextField
            {...register("lname")}
            label="Last Name"
            fullWidth
            error={!!errors.lname}
            helperText={errors.lname?.message}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "white",
              },
            }}
          />
          <Controller
            name="suffix"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                error={!!errors.suffix}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                  },
                }}
              >
                <InputLabel id="suffix-label">Suffix</InputLabel>
                <Select
                  labelId="suffix-label"
                  id="suffix"
                  label="Suffix"
                  {...field}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Jr">Jr.</MenuItem>
                  <MenuItem value="Sr">Sr.</MenuItem>
                  <MenuItem value="III">III</MenuItem>
                  <MenuItem value="IV">IV</MenuItem>
                  <MenuItem value="V">V</MenuItem>
                </Select>
                {errors.suffix && (
                  <Typography color="error" variant="caption">
                    {errors.suffix?.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
          <TextField
            fullWidth
            type="date"
            label="Birthday"
            variant="outlined"
            {...register("birthday")}
            error={!!errors.birthday}
            helperText={errors.birthday?.message}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonthRounded />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "white",
              },
            }}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                error={!!errors.gender}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                  },
                }}
              >
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  label="Gender"
                  {...field}
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  <MenuItem value="male">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Male fontSize="small" /> Male
                    </Box>
                  </MenuItem>
                  <MenuItem value="female">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Female fontSize="small" /> Female
                    </Box>
                  </MenuItem>
                </Select>
                {errors.gender && (
                  <Typography color="error" variant="caption">
                    {errors.gender.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
          <TextField
            {...register("mobile_number")}
            label="Mobile Number"
            fullWidth
            error={!!errors.mobile_number}
            helperText={errors.mobile_number?.message}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "white",
              },
            }}
          />
          <TextField
            {...register("username")}
            label="Username"
            fullWidth
            error={!!errors.username}
            helperText={errors.username?.message}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "white",
              },
            }}
          />
        </Box>

        <TextField
          {...register("address")}
          label="Address"
          fullWidth
          multiline
          rows={2}
          error={!!errors.address}
          helperText={errors.address?.message}
          sx={{
            mt: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "white",
            },
          }}
        />

        <TextField
          {...register("email")}
          label="Email"
          fullWidth
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={{
            mt: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "white",
            },
          }}
        />

        <Controller
          name="role_type"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              error={!!errors.role_type}
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "white",
                },
              }}
            >
              <InputLabel id="role_type-label">Role Type</InputLabel>
              <Select
                labelId="role_type-label"
                id="role_type"
                label="Role Type"
                {...field}
              >
                <MenuItem value="">Select Role</MenuItem>
                <MenuItem value="admin">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <VerifiedUser fontSize="small" /> Admin
                  </Box>
                </MenuItem>
                <MenuItem value="customer">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SupervisedUserCircle fontSize="small" /> Customer
                  </Box>
                </MenuItem>
              </Select>
              {errors.role_type && (
                <Typography color="error" variant="caption">
                  {errors.role_type.message}
                </Typography>
              )}
            </FormControl>
          )}
        />
      </DialogComponent>

      {/* Archive/Restore User Dialog using DialogComponent */}
      <DialogComponent
        open={openDeleteDialog}
        onClose={handleClose}
        onSubmit={handleDeleteUser}
        title={restoreUser ? "Restore User" : "Archive User"}
        icon={restoreUser ? <Check /> : <Close />}
        isLoading={isArchiving}
        submitLabel={restoreUser ? "Restore" : "Archive"}
        submitIcon={<Check />}
        maxWidth="sm"
        isArchived={true}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 2,
          }}
        >
          <Box
            sx={{
              fontSize: "4rem",
              opacity: 0.5,
            }}
          >
            {restoreUser ? "🔄" : "🗑️"}
          </Box>
          <Typography variant="h6" fontWeight={600} textAlign="center">
            Are you sure?
          </Typography>
          <Typography color="text.secondary" textAlign="center">
            Are you sure you want to {restoreUser ? "restore" : "archive"} this
            user?
            {!restoreUser && " This action will deactivate the user account."}
          </Typography>
        </Box>
      </DialogComponent>
    </>
  );
};

export default User;
