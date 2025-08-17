import React from "react";
import TableComponent from "../../components/TableComponent";
import defaultImage from "../../assets/default-image.png";
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
  Select,
  TextField,
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
import { deceasedSchema } from "../../validations/validation";
import FileUploadInput from "../../components/FileUploadInput";
import { useGetLotQuery } from "../../redux/slices/apiLot";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { toast } from "sonner";

const Deceased = () => {
  const [status, setStatus] = useState("active");
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

  const { data: lotData, isLoading: isLotDataLoading } = useGetLotQuery(
    {
      pagination: "none",
      lot_status: "sold",
    },
    []
  );

  const [addDeceased, { isLoading: isAddLotLoading }] =
    useAddDeceasedMutation();
  const [updateDeceased, { isLoading: isUpdateLotLoading }] =
    useUpdateDeceasedMutation();
  const [archivedDeceased, { isLoading: isArchivedLotLoading }] =
    useArchivedDeceasedMutation();

  const {
    data: deceasedData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetDeceasedQuery({
    search,
    page: page + 1,
    per_page: rowsPerPage,
    status,
  });

  const {
    register,
    reset,
    handleSubmit,
    inputError,
    setError,
    setValue,
    watch,
    control,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: {
      lot_id: "",
      lot_image: null,
      fname: "",
      mname: "",
      lname: "",
      suffix: "",
      gender: "",
      birthday: "",
      death_date: "",
      is_private: "",
      death_certificate: null,
    },
    resolver: yupResolver(deceasedSchema),
  });

  const columns = [
    { field: "id", headerName: "ID", align: "center" },
    {
      field: "lot_image",
      headerName: "Lot Image",
      align: "center",
      valueGetter: (row) =>
        row.lot_image ? (
          <img
            src={row.lot_image}
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
    { field: "full_name", headerName: "Fullname", align: "center" },
    { field: "gender", headerName: "Gender", align: "center" },
    { field: "birthday", headerName: "Birthday", align: "center" },
    { field: "death_date", headerName: "Date Death", align: "center" },
    {
      field: "death_certificate",
      headerName: "Burial Certificate",
      align: "center",
      valueGetter: (row) =>
        row.death_certificate ? (
          <img
            src={row.death_certificate}
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
      field: "visibility",
      headerName: "Visilibity",
      align: "center",
    },
    {
      field: "created_at",
      headerName: "Created At",
      align: "center",
      valueGetter: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      field: "Action",
      headerName: "Actions",
      align: "center",
      renderCell: ({ row, index }) => (
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
                handleEditModal(row);
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCloseDropDown();
                setOpenModalArchived(true);
                setSelectedID(row.id);
                setIsArchived(true);
              }}
            >
              {status === "inactive" ? "Restore" : "Archive"}
            </MenuItem>
          </Menu>
        </>
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

  // add deceased
  const handleAddDeceased = async (data) => {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        // Only append if value is not null or undefined
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const response = await addDeceased(formData).unwrap();
      setopenModal(false);
      reset();
      toast.success(response?.message);
    } catch (error) {
      error?.data?.errors.map(
        (inputError, index) => toast.error(error?.data?.errors[0].detail),
        setError(cleanPointer(inputError?.source?.pointer), {
          type: "message",
          message: inputError?.detail,
        })
      );
    }
  };

  const handleEditModal = (data) => {
    setIsEdit(true);
    console.log(data);
    reset({
      id: data?.id,
      lot_id: data?.lot_id,
      lot_image: data?.lot_image,
      fname: data?.fname,
      mname: data?.mname,
      lname: data?.lname,
      suffix: data?.suffix,
      gender: data?.gender,
      is_private: data?.is_private,
      birthday: data?.birthday,
      death_date: data?.death_date,
      death_certificate: data?.death_certificate,
    });
    setopenModal(true);
  };

  const handleUpdateDeceased = async (data) => {
    try {
      const id = data.id;

      const formData = new FormData();

      // formData.append("_method", "PATCH");

      // Object.entries(data).forEach(([key, value]) => {
      //   if (value !== undefined && value !== null) {
      //     formData.append(key, value instanceof File ? value : String(value));
      //   }
      // });

      formData.append("_method", "PATCH");

      formData.append("id", String(data.id));
      formData.append("lot_id", String(data.lot_id));
      formData.append("fname", data.fname);
      formData.append("mname", data.mname || ""); // Optional
      formData.append("lname", data.lname);
      formData.append("suffix", data.suffix || ""); // Optional
      formData.append("gender", data.gender);
      formData.append("birthday", data.birthday);
      formData.append("death_date", data.death_date);
      formData.append("is_private", data.is_private);

      // Only append if it's a new File
      if (data.death_certificate instanceof File) {
        formData.append("death_certificate", data.death_certificate);
      }

      if (data.lot_image instanceof File) {
        formData.append("lot_image", data.lot_image);
      }

      const response = await updateDeceased({ id, formData }).unwrap();

      // Reset form after success
      reset({
        id: "",
        lot_id: "",
        lot_image: "",
        fname: "",
        mname: "",
        lname: "",
        suffix: "",
        gender: "",
        birthday: "",
        death_date: "",
        is_private: "",
        death_certificate: "",
      });

      refetch();
      setopenModal(false);
      setIsEdit(false);
      console.log(response);
      toast.success(response?.message);
    } catch (error) {
      toast.error(error?.data?.errors?.[0]?.detail || "Something went wrong.");
    }
  };

  const handleArchivedDeceased = async () => {
    console.log("hit handlearchive");
    try {
      const response = await archivedDeceased({ id: selectedID }).unwrap();
      setOpenModalArchived(false);
      setIsArchived(false);
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
          <PersonOffIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Deceased
        </Typography>
      </Breadcrumbs>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" sx={{ mr: 2, fontWeight: 600 }}>
          Deceased Management
        </Typography>
        <Button
          size="medium"
          variant="contained"
          onClick={() => setopenModal(true)}
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
      <TableComponent
        columns={columns}
        data={deceasedData?.data?.data || []}
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
      {/* dialog for creating deceased */}
      <DialogComponent
        open={openModal}
        onClose={() => {
          setopenModal(false),
            setIsEdit(false),
            reset({
              id: "",
              lot_id: "",
              lot_image: "",
              fname: "",
              mname: "",
              lname: "",
              suffix: "",
              gender: "",
              birthday: "",
              death_date: "",
              is_private: "",
              death_certificate: "",
            });
        }}
        onSubmit={isEdit ? handleUpdateDeceased : handleAddDeceased}
        title={isEdit ? "Update Deceased" : "Add Deceased"}
        icon={<Add color="secondary" />}
        isLoading={isEdit ? isUpdateLotLoading : isAddLotLoading}
        submitIcon={<Check />}
        submitLabel={isEdit ? "Update" : "Confirm"}
        formMethods={{ handleSubmit, reset }}
        isValid={isValid}
        isDirty={isDirty}
      >
        <Controller
          name="lot_image"
          control={control}
          defaultValue={null}
          render={({ field }) => (
            <FileUploadInput
              title="Lot Image"
              name="lot_image"
              value={field.value}
              onChange={field.onChange}
              setValue={setValue}
              previousImageUrl={defaultImage}
              error={!!errors.lot_image}
              helperText={errors.lot_image?.message}
            />
          )}
        />
        <Controller
          name="lot_id"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormControl fullWidth sx={{ paddingTop: 1 }}>
              <InputLabel id="lot-label" sx={{ paddingTop: 1 }}>
                Lot
              </InputLabel>
              <Select
                {...field}
                labelId="lot-label"
                id="lot_id"
                label="lot_id"
                error={!!errors.lot_id}
              >
                {isLotDataLoading ? (
                  <MenuItem value="" disabled>
                    Loading...
                  </MenuItem>
                ) : (
                  lotData?.data?.map((lot) => (
                    <MenuItem key={lot.id} value={lot.id}>
                      {lot.lot_number}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.lot_id && (
                <Typography color="error" variant="caption">
                  {errors.lot_id.message}
                </Typography>
              )}
            </FormControl>
          )}
        />
        <TextField
          {...register("fname")}
          label="First Name"
          margin="dense"
          type="text"
          fullWidth
          error={!!errors.fname}
          helperText={errors.fname?.message}
        />
        <TextField
          {...register("mname")}
          label="Middle Name"
          type="text"
          margin="dense"
          fullWidth
          error={!!errors.mname}
          helperText={errors.mname?.message}
        />
        <TextField
          {...register("lname")}
          label="Last Name"
          type="text"
          margin="dense"
          fullWidth
          error={!!errors.lname}
          helperText={errors.lname?.message}
        />
        <Controller
          name="suffix"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="suffix-label">Suffix</InputLabel>
              <Select
                {...field}
                labelId="suffix-label"
                id="suffix"
                label="Suffix"
                error={!!errors.suffix}
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
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                {...field}
                labelId="gender-label"
                id="gender"
                label="Gender"
                error={!!errors.gender}
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
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
                <CalendarMonth />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          type="date"
          label="Death Date"
          variant="outlined"
          {...register("death_date")}
          error={!!errors.death_date}
          helperText={errors.death_date?.message}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarMonth />
              </InputAdornment>
            ),
          }}
        />
        <Controller
          name="is_private"
          control={control}
          render={({ field: { onChange, value, name } }) => (
            <FormControl fullWidth>
              <InputLabel id="visibility-label">Visibility</InputLabel>
              <Select
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                labelId="visibility-label"
                id="visibility"
                label="Visibility"
                error={!!errors.is_private}
              >
                <MenuItem value={0}>Public</MenuItem>
                <MenuItem value={1}>Private</MenuItem>
              </Select>
              {errors.is_private && (
                <Typography color="error" variant="caption">
                  {errors.is_private.message}
                </Typography>
              )}
            </FormControl>
          )}
        />
        <Controller
          name="death_certificate"
          control={control}
          defaultValue={null}
          render={({ field }) => (
            <FileUploadInput
              title="Death Certificate Image"
              name="death_certificate"
              value={field.value}
              onChange={field.onChange}
              previousImageUrl={defaultImage}
              error={!!errors.death_certificate}
              helperText={errors.death_certificate?.message}
            />
          )}
        />
      </DialogComponent>

      <DialogComponent
        open={openModalArchived}
        onClose={() => {
          setOpenModalArchived(false);
          setIsArchived(false);
        }}
        onSubmit={handleArchivedDeceased}
        title={status === "inactive" ? "Restore" : "Archive"}
        icon={<Clear color="secondary" />}
        isLoading={isArchivedLotLoading}
        submitIcon={<Check />}
        submitLabel={status === "inactive" ? "Restore" : "Archive"}
        formMethods={{ handleSubmit }}
        isValid={true}
        isDirty={true}
        isArchived={isArchived}
      >
        <Typography variant="body1" sx={{ mt: 1 }}>
          Are you sure you want to{" "}
          {status === "inactive" ? "restore" : "archive"} this data?
        </Typography>
      </DialogComponent>
    </>
  );
};

export default Deceased;
