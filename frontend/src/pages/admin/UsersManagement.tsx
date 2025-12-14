import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Pagination,
  Skeleton,
  Avatar,
  Grid,
} from "@mui/material";
import { Visibility, Block, CheckCircle } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/users";
import type { User } from "@/types";
import toast from "react-hot-toast";

export const UsersManagement = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, roleFilter],
    queryFn: () =>
      usersApi.getAll({ page, limit: 10, role: roleFilter || undefined }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      usersApi.updateRole(userId, role),
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update user role"
      );
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      usersApi.toggleStatus(userId, isActive),
    onSuccess: () => {
      toast.success("User status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update user status"
      );
    },
  });

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Users Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Filter by Role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="user">Users</MenuItem>
              <MenuItem value="admin">Admins</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, idx) => (
                <TableRow key={idx}>
                  {[...Array(6)].map((_, cellIdx) => (
                    <TableCell key={cellIdx}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: User) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        src={user.avatarUrl}
                        alt={user.name}
                        sx={{ width: 40, height: 40 }}
                      >
                        {user.name?.charAt(0)}
                      </Avatar>
                      <Typography fontWeight={500}>{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={user.role}
                      onChange={(e) =>
                        updateRoleMutation.mutate({
                          userId: user._id,
                          role: e.target.value,
                        })
                      }
                      disabled={updateRoleMutation.isPending}
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive !== false ? "Active" : "Inactive"}
                      color={user.isActive !== false ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewUser(user)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      color={user.isActive !== false ? "error" : "success"}
                      onClick={() =>
                        toggleStatusMutation.mutate({
                          userId: user._id,
                          isActive: user.isActive === false,
                        })
                      }
                      disabled={toggleStatusMutation.isPending}
                    >
                      {user.isActive !== false ? <Block /> : <CheckCircle />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={pagination.pages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* View User Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Avatar
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.name}
                  sx={{ width: 80, height: 80, fontSize: "2rem" }}
                >
                  {selectedUser.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Role
                  </Typography>
                  <Chip
                    label={
                      selectedUser.role?.charAt(0).toUpperCase() +
                      selectedUser.role?.slice(1)
                    }
                    size="small"
                    color={
                      selectedUser.role === "admin" ? "primary" : "default"
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={
                      selectedUser.isActive !== false ? "Active" : "Inactive"
                    }
                    size="small"
                    color={
                      selectedUser.isActive !== false ? "success" : "default"
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Joined
                  </Typography>
                  <Typography>{formatDate(selectedUser.createdAt)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography>{formatDate(selectedUser.updatedAt)}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
