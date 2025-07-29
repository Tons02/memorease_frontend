import {
  CalendarMonth,
  CalendarMonthRounded,
  Check,
  Dashboard,
  Female,
  Male,
  SupervisedUserCircle,
  VerifiedUser,
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
} from "@mui/material";
import { UserSchema } from "../validations/validation";
import React, { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
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
    isValid,
    isDirty,
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
    try {
      const response = await updateUser({
        ...formattedData,
        id: selectedID,
      }).unwrap();
      console.log("role updated:", response);
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
  // And extend dayjs with it

  const handleEdit = (row) => {
    dayjs.extend(customParseFormat);
    setSelectedID(row.id);
    if (row) {
      const formattedUser = {
        ...row,
        birthday: dayjs(row.birthday, "DD-MM-YYYY").format("YYYY-MM-DD"),
      };

      reset(formattedUser);
      console.log(watch()); // This should now show the date in YYYY-MM-DD format
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
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" sx={{ mr: 2 }}>
          User
        </Typography>

        <Button
          size="small"
          variant="contained"
          onClick={() => {
            handleCreate();
            handleFocus();
          }}
          color="success"
          sx={{ mt: 1 }}
        >
          Add
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
                      {row?.role_type}
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
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Check />
            <Typography variant="h6" fontWeight="bold">
              {edit ? "Update User" : "Create New User"}
            </Typography>
          </Box>
          <IconButton onClick={() => handleClose()}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

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
            />
            <TextField
              {...register("mi")}
              label="Middle Initial"
              margin="dense"
              fullWidth
              error={!!errors.mi}
              helperText={errors.mi?.message}
            />
            <TextField
              {...register("lname")}
              label="Last Name"
              margin="dense"
              fullWidth
              error={!!errors.lname}
              helperText={errors.lname?.message}
            />
            <Controller
              name="suffix"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.suffix}>
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
            />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.gender}>
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
            />
            <TextField
              {...register("address")}
              label="Address"
              margin="dense"
              fullWidth
              error={!!errors.address}
              helperText={errors.address?.message}
            />
            <TextField
              {...register("username")}
              label="Username"
              margin="dense"
              fullWidth
              error={!!errors.username}
              helperText={errors.username?.message}
            />
            <TextField
              {...register("email")}
              label="Email"
              margin="dense"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <Controller
              name="role_type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.role_type}>
                  <InputLabel id="role_type-label">Role Type</InputLabel>
                  <Select
                    labelId="role_type-label"
                    id="role_type"
                    label="Gender"
                    {...field}
                  >
                    <MenuItem value="">Select Role</MenuItem>
                    <MenuItem value="admin">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <VerifiedUser fontSize="small" /> Admin
                      </Box>
                    </MenuItem>
                    <MenuItem value="customer">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <SupervisedUserCircle fontSize="small" /> customer
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
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="success"
              fullWidth
              disabled={isLoading}
              startIcon={!isLoading && <Check />}
              sx={{ py: 1.5 }}
            >
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
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Check />
            <Typography variant="h6" fontWeight="bold">
              {restoreUser ? "Restore" : "Archived"}
            </Typography>
          </Box>
          <IconButton onClick={() => handleClose()}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography>
            Are you sure you want to {restoreUser ? "restore" : "archived"} this
            record?
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            loading={isLoading}
            onClick={handleDeleteUser}
            startIcon={!isLoading && <Check />}
            sx={{ py: 1.5 }}
          >
            {isArchiving ? <CircularProgress size={20} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default User;
