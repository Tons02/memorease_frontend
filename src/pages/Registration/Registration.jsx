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
  Divider,
  Chip,
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
  Person,
  Security,
} from "@mui/icons-material";

import pmpd_logo from "../../assets/pmpd_logo.png";
import { yupResolver } from "@hookform/resolvers/yup";
import { registrationSchema } from "../../validations/validation";
import { useRegistrationMutation } from "../../redux/slices/apiSlice";
import dayjs from "dayjs";
import "./index.scss";

function Registration() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
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

  const today = new Date();
  const eightYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  console.log("form state errors", errors);

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

    try {
      const response = await registration(formattedData).unwrap();

      setSnackbar({
        open: true,
        message: "Registration successful! Please check your email",
        severity: "success",
      });

      localStorage.setItem("user", JSON.stringify(response?.data));
      localStorage.setItem("token", response?.token);
      localStorage.setItem("email_verified", "");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.log(error);

      if (error?.data?.errors) {
        error.data.errors.forEach((e) => {
          const pointer = e.source?.pointer || "";
          const key = pointer.split("/").pop();
          setError(key, { type: "server", message: e.detail });
        });
      }

      setSnackbar({
        open: true,
        message:
          error?.data?.errors?.[0]?.detail ||
          "Registration failed. Please try again.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Fade in timeout={600}>
        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <Paper
            elevation={10}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 4,
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            {/* Header Section */}
            <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
              <img
                src={pmpd_logo}
                alt="Providence Memorial Park Logo"
                style={{
                  width: window.innerWidth < 600 ? 80 : 120,
                  marginBottom: 16,
                }}
              />
              <Typography
                variant={window.innerWidth < 600 ? "h5" : "h4"}
                fontWeight="bold"
                color="secondary"
                gutterBottom
              >
                Create Account
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Join Providence Memorial Park - Get started by creating your
                account
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Personal Information Section */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: { xs: 2, sm: 3 },
                  }}
                >
                  <Person sx={{ mr: 1, color: "secondary.main" }} />
                  <Typography
                    variant={window.innerWidth < 600 ? "subtitle1" : "h6"}
                    fontWeight="600"
                    color="secondary"
                  >
                    Personal Information
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {/* Row 1: Name fields */}
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="First Name"
                      variant="outlined"
                      {...register("fname")}
                      error={!!errors.fname}
                      helperText={errors.fname?.message}
                      autoComplete="given-name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="M.I."
                      variant="outlined"
                      {...register("mi")}
                      error={!!errors.mi}
                      helperText={errors.mi?.message}
                      autoComplete="additional-name"
                      inputProps={{ maxLength: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      variant="outlined"
                      {...register("lname")}
                      error={!!errors.lname}
                      helperText={errors.lname?.message}
                      autoComplete="family-name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl sx={{ width: 150 }}>
                      <InputLabel id="suffix-label">Suffix</InputLabel>
                      <Select
                        labelId="suffix-label"
                        id="suffix"
                        label="Suffix"
                        {...register("suffix")}
                        error={!!errors.suffix}
                        defaultValue=""
                      >
                        <MenuItem value="">
                          <em style={{ color: "#999" }}>
                            Select Suffix (Optional)
                          </em>
                        </MenuItem>
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

                  {/* Row 2: Gender and Birthday */}
                  <Grid item xs={12} sm={6}>
                    <FormControl sx={{ width: 150 }}>
                      <InputLabel id="gender-label">Gender</InputLabel>
                      <Select
                        labelId="gender-label"
                        id="gender"
                        label="Gender"
                        {...register("gender")}
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
                            <Male fontSize="small" color="secondary" /> Male
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
                            <Female fontSize="small" color="secondary" /> Female
                          </Box>
                        </MenuItem>
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
                      {...register("birthday")}
                      error={!!errors.birthday}
                      helperText={errors.birthday?.message}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonth color="action" />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        max: eightYearsAgo, // 👈 only allows dates up to 8 years ago
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: { xs: 2, sm: 3 } }}>
                <Chip
                  label="Contact Information"
                  color="secondary"
                  variant="outlined"
                />
              </Divider>

              {/* Contact Information Section */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="tel"
                      label="Mobile Number"
                      variant="outlined"
                      {...register("mobile_number")}
                      error={!!errors.mobile_number}
                      helperText={errors.mobile_number?.message}
                      autoComplete="tel"
                      placeholder="+63 xxx xxx xxxx"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Call color="action" />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        maxLength: 13,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      sx={{ width: 300 }}
                      type="email"
                      label="Email Address"
                      variant="outlined"
                      {...register("email")}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      autoComplete="email"
                      placeholder="your.email@example.com"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      sx={{ width: 300 }}
                      label="Complete Address"
                      variant="outlined"
                      multiline
                      rows={2}
                      {...register("address")}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      autoComplete="street-address"
                      placeholder="Street, Barangay, City, Province"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment
                            position="start"
                            sx={{ alignSelf: "flex-start", mt: 1 }}
                          >
                            <LocationOn color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: { xs: 2, sm: 3 } }}>
                <Chip
                  label="Account Security"
                  color="secondary"
                  variant="outlined"
                />
              </Divider>

              {/* Account Security Section */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: { xs: 2, sm: 3 },
                  }}
                >
                  <Security sx={{ mr: 1, color: "secondary.main" }} />
                  <Typography
                    variant={window.innerWidth < 600 ? "subtitle1" : "h6"}
                    fontWeight="600"
                    color="secondary"
                  >
                    Account Credentials
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Username"
                      variant="outlined"
                      {...register("username")}
                      error={!!errors.username}
                      helperText={
                        errors.username?.message || "Choose a unique username"
                      }
                      autoComplete="username"
                      placeholder="Enter desired username"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Password"
                      variant="outlined"
                      {...register("password")}
                      error={!!errors.password}
                      helperText={
                        errors.password?.message ||
                        "Use 8+ characters with mixed case, numbers & symbols"
                      }
                      autoComplete="new-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm Password"
                      variant="outlined"
                      {...register("password_confirmation")}
                      error={!!errors.password_confirmation}
                      helperText={
                        errors.password_confirmation?.message ||
                        "Re-enter your password"
                      }
                      autoComplete="new-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Submit Button */}
              <Box sx={{ mt: { xs: 3, sm: 4 } }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: { xs: 1.5, sm: 1.8 },
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    fontWeight: "bold",
                    borderRadius: 3,
                    background:
                      "linear-gradient(45deg, #1E6E2B 30%, #2c8b3cff 90%)",
                    boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #29943bff 30%, #29943bff 90%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 10px 2px rgba(33, 203, 243, .3)",
                    },
                    "&:disabled": {
                      background: "rgba(0, 0, 0, 0.12)",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Creating Account...
                    </Box>
                  ) : (
                    "Create My Account"
                  )}
                </Button>
              </Box>

              {/* Login Link */}
              <Box sx={{ mt: { xs: 2, sm: 3 }, textAlign: "center" }}>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Already have an account?{" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => navigate("/login")}
                    sx={{
                      color: "secondary.main",
                      fontWeight: "600",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                        color: "secondary.dark",
                      },
                      transition: "color 0.2s ease-in-out",
                    }}
                  >
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </form>
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
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Registration;
