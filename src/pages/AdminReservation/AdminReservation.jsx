import React, { useEffect } from "react";
import TableComponent from "../../components/TableComponent";
import ImageDialog from "../../components/ImageDialog";
import defaultImage from "../../assets/default-image.png";
import CloseIcon from "@mui/icons-material/Close";

import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  Link,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  CalendarMonth,
  Check,
  Clear,
  Dashboard,
  Download,
  EventAvailable,
  Female,
  FilterList,
  Male,
} from "@mui/icons-material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { useState } from "react";
import DialogComponent from "../../components/DialogComponent";
import { yupResolver } from "@hookform/resolvers/yup";
import { rejectReservationSchema } from "../../validations/validation";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { toast } from "sonner";
import {
  useRejectReservationMutation,
  useGetReservationQuery,
  useApproveReservationMutation,
  useLazyGetReservationExportQuery,
} from "../../redux/slices/reservationSlice";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";

const AdminReservation = () => {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openModalFilter, setopenModalFilter] = useState(false);
  const [openModalAproved, setopenModalAproved] = useState(false);
  const [openModalReject, setOpenModalReject] = useState(false);
  const [selectedID, setSelectedID] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedImage(null);
  };

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

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: {
      remarks: "",
    },
    resolver: yupResolver(rejectReservationSchema),
  });

  const handleApply = () => {
    // Commit the temporary dates to the real state
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);

    // Close dialog
    setopenModalFilter(false);

    // Refetch API with new dates
    if (refetch)
      refetchApi({ start_date: tempStartDate, end_date: tempEndDate });
  };

  const [rejectReservation, { isLoading: isRejectReservationLoading }] =
    useRejectReservationMutation();

  const [approveReservation, { isLoading: isApproveReservationLoading }] =
    useApproveReservationMutation();

  const {
    data: reservationData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetReservationQuery({
    search,
    page: page + 1,
    per_page: rowsPerPage,
    status,
    start_date: startDate,
    end_date: endDate,
  });

  // Lazy query
  const [triggerExport, { isLoading: isExportLoading }] =
    useLazyGetReservationExportQuery();

  const handleExport = async () => {
    try {
      const blob = await triggerExport({
        status,
        start_date: startDate,
        end_date: endDate,
      }).unwrap();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reservation-sales.xlsx"; // or .xml if really XML
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting file:", err);
    }
  };

  useEffect(() => {
    const channel = window.Echo.channel("lots").listen(".LotReserved", (e) => {
      console.log("Lot reserved update received:", e);
      refetch();
    });

    return () => {
      channel.stopListening(".LotReserved");
    };
  }, []);

  const columns = [
    { field: "id", headerName: "ID", align: "center" },
    {
      field: "fullname",
      headerName: "Customer Name",
      align: "center",
      valueGetter: (row) => row?.customer?.fullname,
    },
    {
      field: "lot_number",
      headerName: "Lot Number",
      align: "center",
      valueGetter: (row) => row?.lot?.lot_number,
    },
    {
      field: "lot_image",
      headerName: "Lot Image",
      align: "center",
      width: 100,
      valueGetter: (row) =>
        row?.lot?.lot_image ? (
          <img
            src={row?.lot?.lot_image}
            alt="Lot"
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        ) : (
          "N/A"
        ),
    },
    {
      field: "total_downpayment_price",
      headerName: "Downpayment Price",
      align: "center",
    },
    {
      field: "proof_of_payment",
      headerName: "Proof of payment",
      align: "center",
      width: 150,
      renderCell: (params) => {
        if (params.row.proof_of_payment) {
          return (
            <div
              onClick={() => handleImageClick(params.row.proof_of_payment)}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            >
              <img
                src={params.row.proof_of_payment}
                alt="Proof of Payment"
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "2px solid transparent",
                }}
              />
            </div>
          );
        }
        return "N/A";
      },
    },
    {
      field: "reserved_at",
      headerName: "Reserve Date",
      align: "center",
      valueGetter: (row) => dayjs(row.reserved_at).format("MM/DD/YYYY hh:mm A"),
    },
    {
      field: "remarks",
      headerName: "Remarks",
      align: "center",
    },
    {
      field: "status",
      headerName: "Status",
      align: "center",
    },
    {
      field: "created_at",
      headerName: "Created At",
      align: "center",
      valueGetter: (row) => dayjs(row.created_at).format("MM/DD/YYYY hh:mm A"),
    },
    {
      field: "Action",
      headerName: "Action",
      align: "center",
      renderCell: ({ row }) =>
        row.status === "pending" ? (
          <>
            <MoreVertIcon
              sx={{ cursor: "pointer" }}
              onClick={(event) => handleClickDropDown(event, row.id)}
            />
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open && activeMenuRow === row.id}
              onClose={handleCloseDropDown}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem
                onClick={() => {
                  handleCloseDropDown();
                  setSelectedID(row.id);
                  setopenModalAproved(true);
                }}
              >
                Approve
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseDropDown();
                  setSelectedID(row.id);
                  setOpenModalReject(true);
                }}
              >
                Reject
              </MenuItem>
            </Menu>
          </>
        ) : (
          "No Available Actions"
        ),
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRejectReservation = async (body) => {
    console.log("hit handleRejectReservation", body);
    try {
      const response = await rejectReservation({
        id: selectedID,
        body,
      }).unwrap();
      setOpenModalReject(false);
      reset();
      toast.success(response?.message);
    } catch (errors) {
      toast.error(errors?.data?.errors[0]?.title);
    }
  };

  const handleApproveReservation = async (body) => {
    console.log("hit handleApproveReservation", body);
    try {
      const response = await approveReservation({
        id: selectedID,
        body,
      }).unwrap();
      setopenModalAproved(false);
      reset();
      toast.success(response?.message);
    } catch (errors) {
      toast.error(errors?.data?.errors[0]?.title);
    }
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
          href="/Admin/masterlist"
        >
          <ListAltIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Masterlist
        </Link>
        <Typography
          sx={{ color: "text.primary", display: "flex", alignItems: "center" }}
        >
          <EventAvailable sx={{ mr: 0.5 }} fontSize="inherit" />
          Reservation
        </Typography>
      </Breadcrumbs>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        {/* Title */}
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Customer Reservation
        </Typography>

        {/* Buttons grouped */}
        <Box display="flex" gap={1}>
          <Button
            size="medium"
            variant="contained"
            onClick={handleExport}
            disabled={isExportLoading} // disable while loading
            color="success"
            startIcon={
              isExportLoading ? <CircularProgress size={20} /> : <Download />
            }
            sx={{
              mt: 1,
              borderRadius: "10px",
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {isExportLoading ? "Exporting..." : "Export"}
          </Button>
          <Button
            size="medium"
            variant="contained"
            onClick={() => setopenModalFilter(true)}
            color="success"
            startIcon={<FilterList />}
            sx={{
              mt: 1,
              borderRadius: "10px",
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Filter
          </Button>
        </Box>
      </Box>
      <TableComponent
        columns={columns}
        data={reservationData?.data?.data || []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        setSearch={setSearch}
        setStatus={setStatus}
        status={status}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />
      {/* for the image popup proof of payment  */}
      <ImageDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        imageUrl={selectedImage}
        title="Proof of Payment"
      />
      {/* dialog for reject */}
      <DialogComponent
        open={openModalReject}
        onClose={() => {
          setOpenModalReject(false), setSelectedID(null);
        }}
        onSubmit={handleSubmit(handleRejectReservation)}
        title={"Reject Reservation"}
        icon={null}
        isLoading={isRejectReservationLoading}
        submitIcon={<Check />}
        submitLabel={"Confirm"}
        formMethods={{ handleSubmit, reset }}
        isValid={true}
        isDirty={true}
      >
        <TextField
          label="Remarks"
          fullWidth
          margin="normal"
          {...register("remarks")}
          error={!!errors.remarks}
          helperText={errors.remarks?.message}
        />
      </DialogComponent>
      {/* approve  */}
      <DialogComponent
        open={openModalAproved}
        onClose={() => {
          setopenModalAproved(false), setSelectedID(null);
        }}
        onSubmit={handleApproveReservation}
        title={"Approve Reservation"}
        icon={null}
        isLoading={isApproveReservationLoading}
        submitIcon={<Check />}
        submitLabel={"Confirm"}
        formMethods={{ handleSubmit, reset }}
        isValid={true}
        isDirty={true}
        isArchived={true}
      >
        <Typography>Are you sure?</Typography>
      </DialogComponent>
      {/* filter  */}
      <Dialog
        open={openModalFilter}
        onClose={() => setOpenModalFilter(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList color="warning" />
            <Typography variant="h6" fontWeight="bold">
              Filter
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonth color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="date"
            label="End Date"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonth color="action" />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setopenModalFilter(false)}
            variant="contained"
            color="error"
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            color="success"
            fullWidth
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminReservation;
