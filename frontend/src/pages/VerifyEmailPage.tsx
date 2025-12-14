import { useEffect, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [verificationState, setVerificationState] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const verifyMutation = useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      setVerificationState("success");
    },
    onError: (error: any) => {
      setVerificationState("error");
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to verify email. The link may have expired."
      );
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setVerificationState("error");
      setErrorMessage("Invalid verification link. No token provided.");
    }
  }, [token]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%", textAlign: "center" }}>
          {verificationState === "loading" && (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Verifying your email...
              </Typography>
              <Typography color="text.secondary">
                Please wait while we verify your email address.
              </Typography>
            </>
          )}

          {verificationState === "success" && (
            <>
              <CheckCircle
                sx={{ fontSize: 80, color: "success.main", mb: 2 }}
              />
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                fontWeight={600}
              >
                Email Verified!
              </Typography>
              <Alert severity="success" sx={{ mb: 3 }}>
                Your email has been successfully verified. You can now access
                all features of SugarSphere.
              </Alert>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
              >
                Go to Login
              </Button>
            </>
          )}

          {verificationState === "error" && (
            <>
              <ErrorIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                fontWeight={600}
              >
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                The verification link may have expired or already been used.
                Please try logging in or contact support if you need assistance.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button component={RouterLink} to="/login" variant="contained">
                  Go to Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                >
                  Register Again
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};
