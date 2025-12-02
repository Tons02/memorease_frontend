import React, { useEffect, useState } from "react";
import TableComponent from "../../components/TableComponent";
import defaultImage from "../../assets/default-image.png";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Check } from "@mui/icons-material";
import { useGetDeceasedQuery } from "../../redux/slices/deceasedSlice";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DialogComponent from "../../components/DialogComponent";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { transferLotSchema } from "../../validations/validation";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { toast } from "sonner";
import {
  useGetAuditTrailQuery,
  useTransferLotMutation,
  useGetActivityLogQuery,
} from "../../redux/slices/reservationSlice";
import { useGetUserQuery } from "../../redux/slices/userSlice";

const CustomerLot = () => {
  const [tabValue, setTabValue] = useState(0);
  // Removed status state since it's not needed
  const LoginUser = JSON.parse(localStorage.getItem("user"));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [openModal, setopenModal] = useState(false);
  const [selectedLotData, setSelectedLotData] = useState(null);
  const [openPreviousOwners, setOpenPreviousOwners] = useState(false);
  const [selectedPreviousOwners, setSelectedPreviousOwners] = useState([]);

  // Activity Log state
  const [activityPage, setActivityPage] = useState(0);
  const [activityRowsPerPage, setActivityRowsPerPage] = useState(10);
  const [activitySearch, setActivitySearch] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [activeMenuRow, setActiveMenuRow] = useState(null);

  const handleClickDropDown = (event, row) => {
    setActiveMenuRow(row);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDropDown = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const { data: userData, isLoading: isUserDataLoading } = useGetUserQuery({
    pagination: "none",
  });

  const [transferLot, { isLoading: isTransferLotLoading }] =
    useTransferLotMutation();

  const {
    data: auditTrailData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAuditTrailQuery({
    search,
    page: page + 1,
    per_page: rowsPerPage,
    // Removed status parameter
    customer_id: LoginUser?.id,
  });

  const {
    data: activityLogData,
    isLoading: isActivityLogLoading,
    isError: isActivityLogError,
    error: activityLogError,
    refetch: refetchActivityLog,
  } = useGetActivityLogQuery({
    pagination: "paginate",
    page: activityPage + 1,
    per_page: activityRowsPerPage,
    search: activitySearch, // ✅ FIXED: Now passing the search parameter
    user_id: LoginUser?.id,
  });

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: {
      new_owner_id: "",
    },
    resolver: yupResolver(transferLotSchema),
  });

  const handleOpenPreviousOwners = (previousOwners) => {
    setSelectedPreviousOwners(previousOwners || []);
    setOpenPreviousOwners(true);
  };

  const handleClosePreviousOwners = () => {
    setOpenPreviousOwners(false);
    setSelectedPreviousOwners([]);
  };

  const handleEditModal = (row) => {
    setSelectedLotData(row);
    setValue("new_owner_id", "");
    setopenModal(true);
  };

  const handleCloseModal = () => {
    setopenModal(false);
    setSelectedLotData(null);
    reset({
      new_owner_id: "",
    });
  };

  // Lot columns
  const lotColumns = [
    { field: "id", headerName: "ID", align: "center", width: 70 },
    {
      field: "lot_number",
      headerName: "Lot Number",
      align: "center",
      flex: 1,
      valueGetter: (params) => {
        return params.lot?.lot_number || "—";
      },
    },
    {
      field: "lot_image",
      headerName: "Lot Image",
      align: "center",
      width: 100,
      valueGetter: (row) =>
        row?.lot?.lot_image
          ? (console.log(row),
            (
              <img
                src={`https://memorease-pmpdasma.com/storage/${row?.lot?.lot_image}`}
                alt="Lot"
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            ))
          : "N/A",
    },
    {
      field: "current_owner",
      headerName: "Current Owner",
      align: "center",
      flex: 1,
      valueGetter: (params) => {
        const owner = params?.current_owner;
        if (!owner) return "—";

        return `${owner.fname} ${owner.mi ? owner.mi + " " : ""}${owner.lname}${
          owner.suffix ? " " + owner.suffix : ""
        }`.trim();
      },
    },
    {
      field: "previous_owner",
      headerName: "Previous Owner",
      align: "center",
      flex: 1,
      renderCell: ({ row }) => {
        const previousOwners = row.previous_owner;

        if (!previousOwners || previousOwners.length === 0) {
          return "—";
        }

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>{previousOwners.length} owner(s)</span>
            <IconButton
              size="small"
              onClick={() => handleOpenPreviousOwners(previousOwners)}
              sx={{ color: "secondary.main" }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </div>
        );
      },
    },
    {
      field: "Action",
      headerName: "Actions",
      align: "center",
      width: 100,
      renderCell: ({ row }) => (
        <>
          <MoreVertIcon
            sx={{ cursor: "pointer" }}
            onClick={(event) => handleClickDropDown(event, row)}
          />
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open && activeMenuRow === row}
            onClose={handleCloseDropDown}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem
              onClick={() => {
                handleCloseDropDown();
                handleEditModal(row);
              }}
            >
              Transfer Ownership
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ];

  // Activity Log columns
  const activityLogColumns = [
    { field: "id", headerName: "ID", align: "center", width: 70 },
    {
      field: "action",
      headerName: "Action",
      align: "center",
      flex: 1,
    },
    {
      field: "user",
      headerName: "User",
      align: "center",
      flex: 1,
      valueGetter: (params) => {
        const user = params?.user;
        if (!user) return "—";

        return `${user.fname} ${user.mi ? user.mi + " " : ""}${user.lname}${
          user.suffix ? " " + user.suffix : ""
        }`.trim();
      },
    },
    {
      field: "created_at",
      headerName: "Date & Time",
      align: "center",
      flex: 1,
      valueGetter: (params) => {
        if (!params.created_at) return "—";
        return new Date(params.created_at).toLocaleString();
      },
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActivityChangePage = (event, newPage) => {
    setActivityPage(newPage);
  };

  const handleActivityChangeRowsPerPage = (event) => {
    setActivityRowsPerPage(parseInt(event.target.value, 10));
    setActivityPage(0);
  };

  const handleTransferLot = async (data) => {
    console.log(data);
    try {
      const response = await transferLot({
        id: selectedLotData.id,
        body: {
          new_owner_id: data.new_owner_id,
        },
      }).unwrap();

      toast.success(response.message || "Lot transferred successfully!");
      handleCloseModal();
      refetchActivityLog();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to transfer lot");
      console.error("Transfer error:", error);
    }
  };

  useEffect(() => {
    refetch();
    refetchActivityLog();
  }, [refetch, refetchActivityLog]);

  // Filter out the current owner from the user list
  const availableUsers =
    userData?.data?.filter(
      (user) => user.id !== selectedLotData?.current_owner_id
    ) || [];

  return (
    <>
      <Box margin={3}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
          mt={2}
        >
          <Typography variant="h4" sx={{ mr: 2, fontWeight: 600 }}>
            Audit Trail
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#15803d",
              },
            }}
          >
            <Tab
              label="Lot"
              sx={{
                color: "#555",
                "&.Mui-selected": {
                  color: "#15803d",
                },
                "&:hover": {
                  color: "#15803d",
                },
              }}
            />
            <Tab
              label="Activity Log"
              sx={{
                color: "#555",
                "&.Mui-selected": {
                  color: "#15803d",
                },
                "&:hover": {
                  color: "#15803d",
                },
              }}
            />
          </Tabs>
        </Box>

        {/* Tab Panel 0 - Lot */}
        {tabValue === 0 && (
          <TableComponent
            columns={lotColumns}
            data={auditTrailData?.data?.data || []}
            isLoading={isLoading}
            isError={isError}
            error={error}
            setSearch={setSearch}
            // Removed status and setStatus props
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        )}

        {/* Tab Panel 1 - Activity Log */}
        {tabValue === 1 && (
          <TableComponent
            columns={activityLogColumns}
            data={activityLogData?.data?.data || []}
            isLoading={isActivityLogLoading}
            isError={isActivityLogError}
            error={activityLogError}
            setSearch={setActivitySearch} // ✅ This now properly updates activitySearch
            page={activityPage}
            rowsPerPage={activityRowsPerPage}
            handleChangePage={handleActivityChangePage}
            handleChangeRowsPerPage={handleActivityChangeRowsPerPage}
          />
        )}
      </Box>

      {/* Transfer Lot Dialog */}
      <DialogComponent
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit(handleTransferLot)}
        title="Transfer Lot Ownership"
        icon={<Add color="secondary" />}
        isLoading={isTransferLotLoading}
        submitIcon={<Check />}
        submitLabel="Transfer"
        formMethods={{ handleSubmit, reset }}
        isValid={isValid}
        isDirty={isDirty}
      >
        <Box sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Current Details
          </Typography>
          <Typography variant="body2">
            <strong>Lot Number:</strong>{" "}
            {selectedLotData?.lot?.lot_number || "—"}
          </Typography>
          <Typography variant="body2">
            <strong>Current Owner:</strong>{" "}
            {selectedLotData?.current_owner
              ? `${selectedLotData.current_owner.fname} ${
                  selectedLotData.current_owner.mi
                    ? selectedLotData.current_owner.mi + " "
                    : ""
                }${selectedLotData.current_owner.lname}${
                  selectedLotData.current_owner.suffix
                    ? " " + selectedLotData.current_owner.suffix
                    : ""
                }`
              : "—"}
          </Typography>
        </Box>

        <Controller
          name="new_owner_id"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="new-owner-label">Select New Owner</InputLabel>
              <Select
                {...field}
                labelId="new-owner-label"
                id="new_owner_id"
                label="Select New Owner"
                error={!!errors.new_owner_id}
              >
                {isUserDataLoading ? (
                  <MenuItem value="" disabled>
                    Loading users...
                  </MenuItem>
                ) : availableUsers.length === 0 ? (
                  <MenuItem value="" disabled>
                    No available users
                  </MenuItem>
                ) : (
                  availableUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {`${user.fname} ${user.mi ? user.mi + " " : ""}${
                        user.lname
                      }${user.suffix ? " " + user.suffix : ""}`}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.new_owner_id && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                  {errors.new_owner_id.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <Box sx={{ mt: 2, p: 2, bgcolor: "warning.lighter", borderRadius: 1 }}>
          <Typography variant="caption" color="warning.dark">
            ⚠️ Note:
            <br />
            • This action will transfer the lot ownership.
            <br />
            • The current owner will be added to the previous owners list.
            <br />
            • All deceased recorded in this lot will also be transferred to the
            new owner.
            <br />• This action cannot be undone.
          </Typography>
        </Box>
      </DialogComponent>

      {/* Previous Owners Dialog */}
      <Dialog
        open={openPreviousOwners}
        onClose={handleClosePreviousOwners}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Previous Owners</DialogTitle>
        <DialogContent>
          {selectedPreviousOwners.length > 0 ? (
            <List>
              {selectedPreviousOwners.map((owner, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={`${index + 1}. ${owner}`}
                    secondary={`Transfer #${index + 1}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography
              sx={{ textAlign: "center", color: "text.secondary", py: 2 }}
            >
              No previous owners
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerLot;
