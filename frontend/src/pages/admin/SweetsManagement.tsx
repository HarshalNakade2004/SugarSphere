import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
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
  TextField,
  MenuItem,
  Grid,
  Skeleton,
  Avatar,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Add, Edit, Delete, CloudUpload } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sweetsApi } from "@/api/sweets";
import type { Sweet } from "@/types";
import toast from "react-hot-toast";

const categories = [
  "Laddu",
  "Barfi",
  "Halwa",
  "Peda",
  "Gulab Jamun",
  "Rasgulla",
  "Jalebi",
  "Other",
];

const sweetSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be at least 1"),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  isActive: z.boolean(),
});

type SweetFormData = z.infer<typeof sweetSchema>;

export const SweetsManagement = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sweetToDelete, setSweetToDelete] = useState<Sweet | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-sweets"],
    queryFn: sweetsApi.getAllAdmin,
  });

  const form = useForm<SweetFormData>({
    resolver: zodResolver(sweetSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      quantity: 0,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SweetFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (imageFile) {
        formData.append("image", imageFile);
      }
      return sweetsApi.create(formData);
    },
    onSuccess: () => {
      toast.success("Sweet created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-sweets"] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create sweet");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SweetFormData }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (imageFile) {
        formData.append("image", imageFile);
      }
      return sweetsApi.update(id, formData);
    },
    onSuccess: () => {
      toast.success("Sweet updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-sweets"] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update sweet");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting sweet with id:", id);
      return sweetsApi.delete(id);
    },
    onSuccess: () => {
      toast.success("Sweet deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-sweets"] });
      setDeleteDialogOpen(false);
      setSweetToDelete(null);
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete sweet");
    },
  });

  const sweets = data?.data || [];

  const handleOpenDialog = (sweet?: Sweet) => {
    if (sweet) {
      setEditingSweet(sweet);
      form.reset({
        name: sweet.name,
        description: sweet.description,
        price: sweet.price,
        category: sweet.category,
        quantity: sweet.quantity,
        isActive: sweet.isActive,
      });
      setImagePreview(sweet.imageUrl || null);
    } else {
      setEditingSweet(null);
      form.reset();
      setImagePreview(null);
    }
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSweet(null);
    form.reset();
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: SweetFormData) => {
    if (editingSweet) {
      updateMutation.mutate({ id: editingSweet._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight={600}>
          Products Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Sweet
        </Button>
      </Box>

      {/* Sweets Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, idx) => (
                <TableRow key={idx}>
                  {[...Array(7)].map((_, cellIdx) => (
                    <TableCell key={cellIdx}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sweets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    No sweets found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sweets.map((sweet: Sweet) => (
                <TableRow key={sweet._id} hover>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={sweet.imageUrl || "/placeholder-sweet.jpg"}
                      alt={sweet.name}
                      sx={{ width: 50, height: 50 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>{sweet.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={sweet.category} size="small" />
                  </TableCell>
                  <TableCell>₹{sweet.price}</TableCell>
                  <TableCell>
                    <Chip
                      label={sweet.quantity}
                      size="small"
                      color={
                        sweet.quantity < 10
                          ? "error"
                          : sweet.quantity < 50
                          ? "warning"
                          : "success"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sweet.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={sweet.isActive ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(sweet)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => {
                        setSweetToDelete(sweet);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSweet ? "Edit Sweet" : "Add New Sweet"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  {...form.register("name")}
                  error={!!form.formState.errors.name}
                  helperText={form.formState.errors.name?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Category"
                      error={!!form.formState.errors.category}
                      helperText={form.formState.errors.category?.message}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  {...form.register("description")}
                  error={!!form.formState.errors.description}
                  helperText={form.formState.errors.description?.message}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Price (₹)"
                  type="number"
                  {...form.register("price")}
                  error={!!form.formState.errors.price}
                  helperText={form.formState.errors.price?.message}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  {...form.register("quantity")}
                  error={!!form.formState.errors.quantity}
                  helperText={form.formState.errors.quantity?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="isActive"
                  control={form.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Active (visible for sale)"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <input
                    type="file"
                    id="sweet-image"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                  <label htmlFor="sweet-image">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                    >
                      Upload Image
                    </Button>
                  </label>
                </Box>
                {imagePreview && (
                  <Avatar
                    variant="rounded"
                    src={imagePreview}
                    sx={{ width: 100, height: 100, mt: 2 }}
                  />
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={form.handleSubmit(onSubmit)}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : editingSweet
              ? "Update"
              : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{sweetToDelete?.name}"? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              console.log(
                "Confirm delete clicked, sweetToDelete:",
                sweetToDelete
              );
              if (sweetToDelete?._id) {
                console.log(
                  "Calling deleteMutation.mutate with id:",
                  sweetToDelete._id
                );
                deleteMutation.mutate(sweetToDelete._id);
              } else {
                console.log("No sweetToDelete._id found!");
              }
            }}
            disabled={deleteMutation.isPending || !sweetToDelete}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
