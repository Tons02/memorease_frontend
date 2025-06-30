import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Snackbar,
  Alert,
  Paper,
  Fade,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import pmpd_logo from "../assets/pmpd_logo.png";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { loginSchema } from "../validations/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLoginMutation } from "../redux/slices/apiSlice";
import { AccountCircle, Lock } from "@mui/icons-material";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const onSubmit = async (data) => {
    try {
      const response = await login(data).unwrap();

      setSnackbar({
        open: true,
        message: "Login successful!",
        severity: "success",
      });

      localStorage.setItem("user", JSON.stringify(response?.data));
      localStorage.setItem("token", response?.token);

      if (response?.data?.role?.name == "customer") {
        setTimeout(() => {
          navigate("/");
        }, 500);
      } else {
        setTimeout(() => {
          navigate("/admin");
        }, 500);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error?.data?.errors?.[0]?.title || "Login failed. Please try again.",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Fade in timeout={600}>
        <Container maxWidth="xs">
          <Paper
            elevation={10}
            sx={{
              p: 4,
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
                Welcome Back
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sign in to your account
              </Typography>
            </Box>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid item xs={12} spacing={2}>
                <TextField
                  fullWidth
                  label="Username"
                  {...register("username")}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  autoComplete="username"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    mb: 1,
                    "& .MuiInput-underline:after": {
                      borderBottomColor: "#000000", // For the underline
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#000000", // For the floating label
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#000000",
                      },
                  }}
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                    },
                  }}
                  autoComplete="current-password"
                  sx={{
                    "& .MuiInput-underline:after": {
                      borderBottomColor: "#000000", // For the underline
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#000000", // For the floating label
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#000000",
                      },
                  }}
                />
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                sx={{
                  mt: 1,
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
                  "Login"
                )}
              </Button>
            </form>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2">
                Don't have an account?{" "}
                <Link
                  component="button"
                  onClick={() => navigate("/registration")}
                  color="secondary"
                >
                  Sign Up
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
    </Box>
  );
};

export default LoginForm;
