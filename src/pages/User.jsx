import {
  CalendarMonth,
  CalendarMonthRounded,
  Dashboard,
  Female,
  Male,
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
} from "@mui/material";
import { UserSchema } from "../validations/validation";
import React, { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import Link from "@mui/material/Link";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import {
  useAddUserMutation,
  useArchivedUserMutation,
  useGetUserQuery,
  useLazyGetRoleDropDownQuery,
  useUpdateUserMutation,
} from "../redux/slices/apiSlice";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch,
    inputError,
    setValue,
  } = useForm({
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

  const [
    triggerRole,
    { data: roles, isLoading: isRoleLoading, isError: isRoleError },
  ] = useLazyGetRoleDropDownQuery();

  const handleFocus = () => {
    if (!roles) {
      triggerRole();
    }
  };

  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [archiveUser] = useArchivedUserMutation();

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
      setSnackbar({
        open: true,
        message: response?.message,
        severity: "success",
      });
    } catch (error) {
      console.log(error?.data?.errors);
      if (error?.data?.errors) {
        error.data.errors.forEach((e) => {
          const pointer = e.source?.pointer || "";
          const key = pointer.split("/").pop();
          setError(key, { type: "server", message: e.detail });
        });
      }
      setSnackbar({
        open: true,
        message: "Please Double Check your input",
        severity: "error",
      });
    }
  };

  // Handle Update User
  const handleUpdateUser = async (data) => {
    const formattedData = {
      ...data,
      birthday: dayjs(data.birthday).format("DD-MM-YYYY"),
    };
    try {
      const response = await updateUser({
        ...formattedData,
        id: selectedID,
      }).unwrap();
      console.log("role updated:", response);
      refetch();
      setOpenDialog(false);
      setEdit(false);
      setSnackbar({
        open: true,
        message: response?.message,
        severity: "success",
      });
    } catch (error) {
      if (error?.data?.errors) {
        error.data.errors.forEach((e) => {
          const pointer = e.source?.pointer || "";
          const key = pointer.split("/").pop();
          setError(key, { type: "server", message: e.detail });
        });
      }
      setSnackbar({
        open: true,
        message: error?.message || "An unexpected error occurred",
        severity: "error",
      });
    }
  };

  const handleEdit = (row) => {
    triggerRole();

    setSelectedID(row.id);
    if (row) {
      const formattedUser = {
        ...row,
        birthday: dayjs(row.birthday, "DD-MM-YYYY").format("YYYY-MM-DD"),
      };

      reset(formattedUser);
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
      setSnackbar({
        open: true,
        message: response?.message,
        severity: "success",
      });
    } catch (errors) {
      console.error("Error archiving role:", errors?.data?.errors?.[0]?.detail);
      setSnackbar({
        open: true,
        message:
          errors?.data?.errors?.[0]?.detail || "An unexpected error occurred",
        severity: "error",
      });
    }
  };

  const handleChangeStatus = (event) => {
    // Update status based on checkbox state
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
    setPage(0); // Reset to first page when changing rows per page
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

  const commonTextFieldSx = {
    mb: 2, // Consistent margin bottom for all fields
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#000000", // Label color when focused
    },
    // For OutlinedInput variant, this is how you style the border on focus
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
    },
    // For Filled or Standard variant (if you change variant)
    "& .MuiInput-underline:after": {
      borderBottomColor: "#000000",
    },
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
        <Link
          underline="hover"
          sx={{
            display: "flex",
            alignItems: "center",
          }}
          color="inherit"
          href="/Admin/user-management"
        >
          <AssignmentIndIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          User Management
        </Link>
        <Typography
          sx={{ color: "text.primary", display: "flex", alignItems: "center" }}
        >
          <GroupIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          User
        </Typography>
      </Breadcrumbs>
      <Typography variant="h4">User</Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ marginBottom: 2 }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            handleCreate();
            handleFocus();
          }}
          sx={{ marginLeft: "auto", borderRadius: "10px" }}
        >
          ADD
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderTop: "1px solid #ccc",
          maxHeight: 650,
          minHeight: 450,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ padding: 1.5 }} // Adding padding here
        >
          <FormControlLabel
            control={<Checkbox color="success" onChange={handleChangeStatus} />}
            label="Archived"
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
                console.log("Search term:", e.target.value);
              }
            }}
            sx={{
              width: 250,
              height: 50,
              marginTop: 1,
              marginRight: 1,
              backgroundColor: "#f5f5f5", // Light gray background
              borderRadius: "15px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "15px",
                height: 50,
                "& fieldset": {
                  borderColor: "#5a6872", // Border color
                },
                "&:hover fieldset": {
                  borderColor: "#5a6872",
                },
              },
            }}
          />
        </Box>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell align="center">First Name</TableCell>
                <TableCell align="center">Middle Name</TableCell>
                <TableCell align="center">Last Name</TableCell>
                <TableCell align="center">Suffix</TableCell>
                <TableCell align="center">Gender</TableCell>
                <TableCell align="center">Mobile Number</TableCell>
                <TableCell align="center">Birthday</TableCell>
                <TableCell align="center">Address</TableCell>
                <TableCell align="center">Username</TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell align="center">Role</TableCell>
                <TableCell align="center">Created At</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* If loading, show skeleton loader */}
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell align="center" component="th" scope="row">
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="60%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="70%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="60%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="80%" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                // If error, show error message
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Error: {error.message}
                  </TableCell>
                </TableRow>
              ) : (
                // Once data is loaded, render the rows
                role?.data?.data?.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell align="center" scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell component="th" align="center" scope="row">
                      {row.fname}
                    </TableCell>
                    <TableCell component="th" align="center" scope="row">
                      {row?.mi}
                    </TableCell>
                    <TableCell component="th" align="center" scope="row">
                      {row.lname}
                    </TableCell>
                    <TableCell component="th" align="center" scope="row">
                      {row?.suffix}
                    </TableCell>
                    <TableCell component="th" align="center" scope="row">
                      {row.gender}
                    </TableCell>
                    <TableCell component="th" align="center" scope="row">
                      {row.mobile_number}
                    </TableCell>
                    <TableCell component="th" align="center" scope="row">
                      {row.birthday}
                    </TableCell>
                    <TableCell component="th" align="center" scope="row">
                      {row.address}
                    </TableCell>
                    <TableCell component="th" align="center" scope="row">
                      {row.username}
                    </TableCell>
                    <TableCell component="th" align="center" scope="row">
                      {row.email}
                    </TableCell>
                    <TableCell component="th" align="center" scope="row">
                      {row?.role?.name}
                    </TableCell>
                    <TableCell align="center">
                      {dayjs(row.created_at).format("YYYY-MM-DD")}
                    </TableCell>
                    <TableCell align="center">
                      {row.deleted_at === null ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell align="center" sx={{ padding: "5px", gap: 2 }}>
                      <MoreVertIcon
                        onClick={(event) => handleClickDrowpDown(event, row)}
                      />

                      <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={activeMenuRow === row.id && open}
                        onClose={handleCloseDropDown}
                        MenuListProps={{
                          "aria-labelledby": "basic-button",
                        }}
                      >
                        {status === "active" ? (
                          <Box>
                            <MenuItem
                              onClick={() => {
                                handleCloseDropDown();
                                handleEdit(row);
                              }}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                handleCloseDropDown();
                                handleDeleteClick(row);
                              }}
                            >
                              Archived
                            </MenuItem>
                          </Box>
                        ) : (
                          <MenuItem
                            onClick={() => {
                              handleCloseDropDown();
                              handleDeleteClick(row);
                              setRestoreUser(true);
                            }}
                          >
                            Restore
                          </MenuItem>
                        )}
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            padding: 1,
            borderTop: "1px solid #ccc",
          }}
        >
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={role?.data?.data?.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </TableContainer>

      {/* Dialog Create  */}

      <Dialog open={openDialog} fullWidth maxWidth="sm">
        <DialogTitle>{edit ? "Update User" : "Create New User"}</DialogTitle>
        <form
          onSubmit={
            edit
              ? handleSubmit(handleUpdateUser)
              : handleSubmit(handleCreateUser)
          }
        >
          <Divider />
          <DialogContent>
            <TextField
              {...register("fname")}
              label="First Name"
              margin="dense"
              fullWidth
              error={!!errors.fname}
              helperText={errors.fname?.message}
              sx={commonTextFieldSx}
            />
            <TextField
              {...register("mi")}
              label="Middle Initial"
              margin="dense"
              fullWidth
              error={!!errors.mi}
              helperText={errors.mi?.message}
              sx={commonTextFieldSx}
            />
            <TextField
              {...register("lname")}
              label="Last Name"
              margin="dense"
              fullWidth
              error={!!errors.lname}
              helperText={errors.lname?.message}
              sx={commonTextFieldSx}
            />
            <Controller
              name="suffix"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  sx={{ ...commonTextFieldSx, width: 535, paddingBottom: 1 }}
                  error={!!errors.suffix}
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
                shrink: true, // Make label shrink even when empty, common for date inputs
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthRounded />
                  </InputAdornment>
                ),
              }}
              sx={{ ...commonTextFieldSx }}
            />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <FormControl
                  sx={{ ...commonTextFieldSx, width: 535 }}
                  error={!!errors.gender}
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Male fontSize="small" /> Male
                      </Box>
                    </MenuItem>
                    <MenuItem value="female">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
              margin="dense"
              fullWidth
              error={!!errors.mobile_number}
              helperText={errors.mobile_number?.message}
              sx={commonTextFieldSx}
            />
            <TextField
              {...register("address")}
              label="Address"
              margin="dense"
              fullWidth
              error={!!errors.address}
              helperText={errors.address?.message}
              sx={commonTextFieldSx}
            />
            <TextField
              {...register("username")}
              label="Username"
              margin="dense"
              fullWidth
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={commonTextFieldSx}
            />
            <TextField
              {...register("email")}
              label="Email"
              margin="dense"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={commonTextFieldSx}
            />
            <Controller
              name="role_id"
              control={control}
              render={({ field }) => (
                <FormControl
                  sx={{ ...commonTextFieldSx, width: 535 }}
                  error={!!errors.role_id}
                >
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    label="Role"
                    {...field}
                    onOpen={handleFocus} // trigger API when dropdown opens
                  >
                    <MenuItem value="">Select Role</MenuItem>
                    {roles?.data?.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {role.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.role_id && (
                    <Typography color="error" variant="caption">
                      {errors.role_id.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button
              onClick={() => handleClose()}
              color="error"
              variant="contained"
            >
              Cancel
            </Button>
            <Button type="submit" color="success" variant="contained">
              {isAdding || isUpdating ? (
                <CircularProgress size={20} />
              ) : (
                "Submit"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={openDeleteDialog}>
        <DialogTitle>{restoreUser ? "Restore" : "Archived"}</DialogTitle>
        <Divider />
        <DialogContent>
          <Typography>
            Are you sure you want to {restoreUser ? "restore" : "archived"} this
            record?
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            onClick={() => handleClose()}
            variant="contained"
            color="error"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="success"
            variant="contained"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default User;
