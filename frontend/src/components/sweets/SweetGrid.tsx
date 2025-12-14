import { Grid, Box, CircularProgress, Typography } from "@mui/material";
import { Sweet } from "@/types";
import { SweetCard } from "./SweetCard";

interface SweetGridProps {
  sweets: Sweet[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const SweetGrid = ({
  sweets,
  isLoading,
  emptyMessage = "No sweets found",
}: SweetGridProps) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (sweets.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
      {sweets.map((sweet) => (
        <Grid item key={sweet._id} xs={6} sm={6} md={4} lg={3}>
          <SweetCard sweet={sweet} />
        </Grid>
      ))}
    </Grid>
  );
};
