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
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  Link,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  Add,
  CalendarMonth,
  Check,
  Clear,
  Dashboard,
  Female,
  Male,
} from "@mui/icons-material";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import ListAltIcon from "@mui/icons-material/ListAlt";
import {
  useAddDeceasedMutation,
  useArchivedDeceasedMutation,
  useGetDeceasedQuery,
  useUpdateDeceasedMutation,
} from "../../redux/slices/deceasedSlice";
import { useState } from "react";
import DialogComponent from "../../components/DialogComponent";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import {
  deceasedSchema,
  reservationSchema,
} from "../../validations/validation";
import FileUploadInput from "../../components/FileUploadInput";
import { useGetLotQuery } from "../../redux/slices/apiLot";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { toast } from "sonner";
import {
  useArchivedReservationMutation,
  useGetReservationQuery,
  useCancelReservationMutation,
} from "../../redux/slices/reservationSlice";
import dayjs from "dayjs";

const CustomerReservation = () => {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [openModal, setopenModal] = useState(false);
  const [openModalArchived, setOpenModalArchived] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [selectedID, setSelectedID] = useState(false);

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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedImage(null);
  };

  let storedData = null;
  try {
    const userData = localStorage.getItem("user");
    storedData = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Invalid user data in localStorage", error);
  }

  const [cancelReservation, { isLoading: isCancelReservationLoading }] =
    useCancelReservationMutation();

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
    customer_id: storedData?.id ?? "12837218312732718378",
  });

  useEffect(() => {
    const channel = window.Echo.channel("lots").listen(".LotReserved", (e) => {
      console.log("Lot reserved update received:", e);
      refetch();
    });

    return () => {
      channel.stopListening(".LotReserved");
    };
  }, []);

  const {
    reset,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: {
      lot_id: "",
      proof_of_payment: null,
      downpayment_price: "",
    },
    resolver: yupResolver(reservationSchema),
  });

  const columns = [
    { field: "id", headerName: "ID", align: "center" },
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
      field: "expires_at",
      headerName: "Expires At",
      align: "center",
      valueGetter: (row) => dayjs(row.expires_at).format("MM/DD/YYYY hh:mm A"),
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
                  setopenModal(true);
                }}
              >
                Cancel
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

  function cleanPointer(pointer) {
    return pointer?.replace(/^\//, ""); // Removes the leading '/'
  }

  const handlCancelReservation = async () => {
    console.log("hit handlCancelReservation");
    try {
      const response = await cancelReservation({ id: selectedID }).unwrap();
      setopenModal(false);
      setSelectedID(null);
      toast.success(response?.message);
    } catch (errors) {
      toast.error(errors?.data?.errors[0]?.title);
    }
  };

  return (
    <>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h4" sx={{ mr: 2, fontWeight: 600 }}>
            Reservations
          </Typography>
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
        {/* dialog for creating deceased */}
        <DialogComponent
          open={openModal}
          onClose={() => {
            setopenModal(false), setSelectedID(null);
          }}
          onSubmit={handlCancelReservation}
          title={"Cancel Reservation"}
          icon={null}
          isLoading={isCancelReservationLoading}
          submitIcon={<Check />}
          submitLabel={"Confirm"}
          formMethods={{ handleSubmit, reset }}
          isValid={true}
          isDirty={true}
          isArchived={true}
        >
          <Typography>Are you sure?</Typography>
        </DialogComponent>
      </Box>
    </>
  );
};

export default CustomerReservation;
