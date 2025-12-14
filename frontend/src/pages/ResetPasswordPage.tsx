import { useState, useEffect } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
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
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle,
} from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const resetPasswordMutation = useMutation({
    mutationFn: () => authApi.resetPassword(token!, newPassword),
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return;
    }
    resetPasswordMutation.mutate();
  };

  const passwordsMatch = newPassword === confirmPassword;
  const isValidPassword = newPassword.length >= 6;

  if (!token) {
    return null;
  }

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
              Reset Password
            </Typography>
            {!success && (
              <Typography color="text.secondary">
                Enter your new password below.
              </Typography>
            )}
          </Box>

          {success ? (
            <Box sx={{ textAlign: "center" }}>
              <CheckCircle
                sx={{ fontSize: 60, color: "success.main", mb: 2 }}
              />
              <Alert severity="success" sx={{ mb: 3 }}>
                Your password has been reset successfully!
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You can now login with your new password.
              </Typography>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
              >
                Go to Login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              {resetPasswordMutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {(resetPasswordMutation.error as any)?.response?.data
                    ?.message ||
                    "Failed to reset password. The link may have expired or already been used."}
                </Alert>
              )}

              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                error={newPassword.length > 0 && !isValidPassword}
                helperText={
                  newPassword.length > 0 && !isValidPassword
                    ? "Password must be at least 6 characters"
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <LockIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                error={confirmPassword.length > 0 && !passwordsMatch}
                helperText={
                  confirmPassword.length > 0 && !passwordsMatch
                    ? "Passwords do not match"
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <LockIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={
                  resetPasswordMutation.isPending ||
                  !isValidPassword ||
                  !passwordsMatch ||
                  !confirmPassword
                }
                sx={{ mb: 2 }}
              >
                {resetPasswordMutation.isPending ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Reset Password"
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
