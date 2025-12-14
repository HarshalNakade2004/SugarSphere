import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { CheckCircle, Error } from "@mui/icons-material";
import { api } from "@/api/client";

export const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const response = await api.post("/auth/verify-email", { token });
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center", width: "100%" }}>
          {status === "loading" && (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5">Verifying your email...</Typography>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle
                sx={{ fontSize: 80, color: "success.main", mb: 2 }}
              />
              <Typography variant="h4" gutterBottom fontWeight={600}>
                Email Verified!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <Error sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight={600}>
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                {message}
              </Alert>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/register")}
              >
                Back to Register
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};
