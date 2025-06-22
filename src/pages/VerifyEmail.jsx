import React, { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  useVerifyEmailQuery,
  useResendVerificationMutation,
} from "../redux/slices/apiSlice";
import { Button, CircularProgress, Box, Typography } from "@mui/material";

const VerifyEmail = () => {
  const { id, hash } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const expires = searchParams.get("expires");
  const signature = searchParams.get("signature");

  const { data, error, isLoading, isSuccess } = useVerifyEmailQuery({
    id,
    hash,
    expires,
    signature,
  });

  const [
    resendVerification,
    { isLoading: isResending, isSuccess: resendSuccess },
  ] = useResendVerificationMutation();

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  }, [isSuccess, navigate]);

  if (isLoading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Verifying your email...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error">
          Verification failed. Your link may be expired or invalid.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => resendVerification()}
          sx={{ mt: 2 }}
          disabled={isResending}
        >
          {isResending ? "Resending..." : "Resend Verification Email"}
        </Button>
        {resendSuccess && (
          <Typography color="success.main" mt={2}>
            A new verification email has been sent!
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box textAlign="center" mt={10}>
      <CircularProgress color="success" />
      <Typography mt={2}>Verified successfully! Redirecting...</Typography>
    </Box>
  );
};

export default VerifyEmail;
