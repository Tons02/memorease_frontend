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
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  CalendarMonth,
  Check,
  Dashboard,
  Female,
  Male,
} from "@mui/icons-material";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { useGetDeceasedQuery } from "../../redux/slices/deceasedSlice";
import { useState } from "react";
import DialogComponent from "../../components/DialogComponent";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { deceasedSchema } from "../../validations/validation";
import FileUploadInput from "../../components/FileUploadInput";

const Deceased = () => {
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);

  const {
    data: deceasedData,
    isLoading,
    isError,
    error,
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
    formState: { errors },
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
      burial_date: "",
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
    { field: "birthday", headerName: "Gender", align: "center" },
    { field: "burial_date", headerName: "Burial Date", align: "center" },
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
      field: "created_at",
      headerName: "Created At",
      align: "center",
      valueGetter: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        <Typography variant="h4" sx={{ mr: 2 }}>
          Deceased
        </Typography>

        <Button
          size="small"
          variant="contained"
          color="success"
          onClick={() => setOpenAddModal(true)}
          sx={{ mt: 1 }}
        >
          Add
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
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />
      {/* dialog for creating deceased */}
      <DialogComponent
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSubmit={""}
        title="Add Deceased"
        icon={<Add color="secondary" />}
        isLoading={isLoading}
        submitIcon={<Check />}
        submitLabel="Save"
        formMethods={{ handleSubmit, reset }}
      >
        <FileUploadInput
          name="lot_image"
          title={"Lot Image"}
          imageSetValue={setValue}
          previousImageUrl={defaultImage}
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
        <FormControl fullWidth>
          <InputLabel id="suffix-label">Suffix</InputLabel>
          <Select
            labelId="suffix-label"
            id="suffix"
            label="Suffix"
            {...register("suffix")}
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
        <FormControl fullWidth>
          <InputLabel id="gender-label">Gender</InputLabel>
          <Select
            labelId="gender-label"
            id="gender"
            label="Gender"
            {...register("gender")} // <--- Corrected name
            defaultValue=""
            error={!!errors.gender}
          >
            <MenuItem value="">Select Gender</MenuItem>
            <MenuItem value="male">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Male fontSize="small" /> Male
              </Box>
            </MenuItem>
            <MenuItem value="female">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Female fontSize="small" /> Female
              </Box>
            </MenuItem>
          </Select>
          {errors.gender && (
            <Typography color="error" variant="caption">
              {errors.gender?.message}
            </Typography>
          )}
        </FormControl>
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
        <FileUploadInput
          name="death_certificate"
          title="Death Certificate"
          imageSetValue={setValue}
          previousImageUrl={defaultImage}
        />
      </DialogComponent>
    </>
  );
};

export default Deceased;
