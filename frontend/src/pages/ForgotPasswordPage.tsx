import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Email as EmailIcon, ArrowBack } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate(email);
  };

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
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight={600}
            >
              Forgot Password
            </Typography>
            {!submitted && (
              <Typography color="text.secondary">
                Enter your email address and we'll send you a link to reset your
                password.
              </Typography>
            )}
          </Box>

          {submitted ? (
            <Box sx={{ textAlign: "center" }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                If an account exists with the email <strong>{email}</strong>,
                you will receive a password reset link shortly.
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please check your email inbox and spam folder. The link will
                expire in 24 hours.
              </Typography>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                startIcon={<ArrowBack />}
              >
                Back to Login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              {forgotPasswordMutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {(forgotPasswordMutation.error as any)?.response?.data
                    ?.message ||
                    "Failed to send reset email. Please try again."}
                </Alert>
              )}

              <TextField
                fullWidth
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={forgotPasswordMutation.isPending}
                sx={{ mb: 2 }}
              >
                {forgotPasswordMutation.isPending ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Back to Login
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};
