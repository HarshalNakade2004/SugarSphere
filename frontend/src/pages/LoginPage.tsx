import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    login(data, {
      onSuccess: (data: any) => {
        // Redirect based on user role
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || "Login failed");
      },
    });
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
            <Typography variant="h3" component="h1" gutterBottom>
              🍬
            </Typography>
            <Typography variant="h4" component="h2" fontWeight={600}>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your SugarSphere account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 3 }}
              InputProps={{
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
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoggingIn}
              sx={{ mb: 2 }}
            >
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Forgot your password?
            </Link>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2">
              Don't have an account?{" "}
              <Link component={RouterLink} to="/register">
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
