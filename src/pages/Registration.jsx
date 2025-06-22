import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Grid,
  InputAdornment,
  Fade,
  Snackbar,
  Alert,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";

import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  AccountCircle,
  Lock,
  Email,
  Call,
  LocationOn,
  CalendarMonth,
  Male,
  Female,
} from "@mui/icons-material";

import pmpd_logo from "../assets/pmpd_logo.png"; // Adjust path as needed
import { yupResolver } from "@hookform/resolvers/yup";
import { registrationSchema } from "../validations/validation";
import { useRegistrationMutation } from "../redux/slices/apiSlice";
import dayjs from "dayjs";

function Registration() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    s,
  } = useForm({
    resolver: yupResolver(registrationSchema),
    defaultValues: {
      fname: "",
      mi: "",
      lname: "",
      suffix: "",
      gender: "",
      birthday: "",
      mobile_number: "",
      email: "",
      address: "",
      username: "",
      password: "",
    },
  });

  console.log("form state", errors);

  const navigate = useNavigate();
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [registration, { isLoading }] = useRegistrationMutation();

  const watchedGender = watch("gender");
  const watchedSuffix = watch("suffix");

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      birthday: dayjs(data.birthday).format("DD-MM-YYYY"),
    };
    console.log(formattedData);
    try {
      const response = await registration(formattedData).unwrap();

      setSnackbar({
        open: true,
        message: "Registration successful! Please Check your email",
        severity: "success",
      });

      localStorage.setItem("user", JSON.stringify(response?.data));
      localStorage.setItem("token", response?.token);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.log(error);
      setSnackbar({
        open: true,
        message:
          error?.data?.errors?.[0]?.detail ||
          "Registration failed. Please try again.",
        severity: "error",
      });
    }
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

  return (
    <>
      <Fade in timeout={600}>
        <Container>
          <Paper
            elevation={10}
            sx={{
              p: 4,
              margin: 0,
              borderRadius: 4,
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <img
                src={pmpd_logo}
                alt="Providence Memorial Park Logo"
                style={{ width: 100, marginBottom: 8 }}
              />
              <Typography variant="h5" fontWeight="bold">
                Registration
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Get started by creating your account.
              </Typography>
            </Box>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                {" "}
                {/* Use Grid container */}
                {/* First Row: First Name, Middle Initial, Last Name, Suffix */}
                <Grid item xs={12} sm={6}>
                  {" "}
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    {...register("fname")}
                    error={!!errors.fname}
                    helperText={errors.fname?.message}
                    autoComplete="given-name"
                    InputProps={{
                      // InputProps instead of slotProps for adornments on TextField
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                    sx={commonTextFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Middle Initial"
                    variant="outlined"
                    {...register("mi")}
                    error={!!errors.mi}
                    helperText={errors.mi?.message}
                    autoComplete="additional-name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ ...commonTextFieldSx, width: 150 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name" // Corrected label
                    variant="outlined"
                    {...register("lname")} // <--- Corrected name
                    error={!!errors.lname}
                    helperText={errors.lname?.message}
                    autoComplete="family-name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                    sx={commonTextFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    sx={{ ...commonTextFieldSx, width: 80 }}
                  >
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
                </Grid>
                {/* Second Row: Gender, Birthday, Mobile Number, Email */}
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    sx={{ ...commonTextFieldSx, width: 100 }}
                  >
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
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                    {errors.gender && (
                      <Typography color="error" variant="caption">
                        {errors.gender?.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Birthday"
                    variant="outlined"
                    {...register("birthday")} // <--- Corrected name
                    error={!!errors.birthday}
                    helperText={errors.birthday?.message}
                    InputLabelProps={{
                      shrink: true, // Make label shrink even when empty, common for date inputs
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonth />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ ...commonTextFieldSx, width: 175 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="tel" // Use type="tel" for mobile numbers
                    label="Mobile Number"
                    variant="outlined"
                    {...register("mobile_number")} // <--- Corrected name
                    error={!!errors.mobile_number}
                    helperText={errors.mobile_number?.message}
                    autoComplete="tel"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Call />
                        </InputAdornment>
                      ),
                    }}
                    sx={commonTextFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email Address" // More descriptive label
                    variant="outlined"
                    {...register("email")} // <--- Corrected name
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    autoComplete="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                    sx={commonTextFieldSx}
                  />
                </Grid>
                {/* Third Row: Address */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    variant="outlined"
                    {...register("address")} // <--- Corrected name
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    autoComplete="street-address"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn />
                        </InputAdornment>
                      ),
                    }}
                    sx={commonTextFieldSx}
                  />
                </Grid>
                {/* Fourth Row: Username, Password */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username" // This is for login username, not necessarily first name
                    variant="outlined"
                    {...register("username")} // <--- Ensure this is for the actual username, not just first name
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    autoComplete="username"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                    sx={commonTextFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    variant="outlined"
                    {...register("password")} // <--- Corrected name
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    autoComplete="new-password" // Use new-password for registration
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                    }}
                    sx={commonTextFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm Password" // Add confirm password for better UX
                    variant="outlined"
                    {...register("password_confirmation")} // <--- New field
                    error={!!errors.password_confirmation}
                    helperText={errors.password_confirmation?.message}
                    autoComplete="new-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                    }}
                    sx={commonTextFieldSx}
                  />
                </Grid>
              </Grid>{" "}
              {/* End of Grid container */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                sx={{
                  mt: 3, // More margin top for the button
                  py: 1.5,
                  color: "#fff",
                  ":hover": { backgroundColor: "#166534" },
                  borderRadius: 2,
                  fontWeight: "bold",
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Register Account"
                )}
              </Button>
            </form>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2">
                Already have an account? {/* Changed text */}
                <Link
                  component="button"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "secondary.main",
                    "&:hover": {
                      textDecoration: "underline",
                      color: "primary.dark",
                    },
                    fontWeight: "bold",
                  }}
                >
                  Login {/* Changed text */}
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Fade>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Registration; // Export your component
