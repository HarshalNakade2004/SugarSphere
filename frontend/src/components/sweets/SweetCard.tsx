import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
} from "@mui/material";
import { ShoppingCart, Visibility } from "@mui/icons-material";
import { Sweet } from "@/types";
import { useCartStore } from "@/store";
import toast from "react-hot-toast";

interface SweetCardProps {
  sweet: Sweet;
}

const categoryColors: Record<
  string,
  "primary" | "secondary" | "success" | "warning" | "error" | "info"
> = {
  chocolates: "primary",
  candies: "secondary",
  cookies: "warning",
  cakes: "error",
  pastries: "info",
  indian: "success",
  other: "primary",
};

export const SweetCard = ({ sweet }: SweetCardProps) => {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (sweet.quantity > 0) {
      addItem(sweet, 1);
      toast.success(`${sweet.name} added to cart!`);
    }
  };

  const isOutOfStock = sweet.quantity === 0;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={sweet.imageUrl || "/placeholder-sweet.jpg"}
          alt={sweet.name}
          sx={{
            objectFit: "cover",
            aspectRatio: "4/3",
            width: "100%",
            height: "auto",
          }}
        />
        <Chip
          label={sweet.category}
          size="small"
          color={categoryColors[sweet.category] || "primary"}
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            textTransform: "capitalize",
            fontSize: { xs: "0.65rem", sm: "0.75rem" },
          }}
        />
        {isOutOfStock && (
          <Chip
            label="Out of Stock"
            color="error"
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          noWrap
          sx={{ fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.25rem" } }}
        >
          {sweet.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            mb: 1.5,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            minHeight: { xs: "2.4em", sm: "2.8em" },
          }}
        >
          {sweet.description}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          <Typography
            variant="h5"
            color="primary"
            fontWeight={600}
            sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" } }}
          >
            ₹{sweet.price.toFixed(2)}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              whiteSpace: "nowrap",
            }}
          >
            {sweet.quantity} in stock
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: { xs: 1.5, sm: 2 }, pt: 0 }}>
        <Button
          component={RouterLink}
          to={`/sweets/${sweet._id}`}
          startIcon={<Visibility />}
          size="small"
          sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
        >
          View
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          color="primary"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          size="small"
          sx={{
            bgcolor: "primary.light",
            color: "white",
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
            "&:hover": {
              bgcolor: "primary.main",
            },
            "&:disabled": {
              bgcolor: "grey.300",
            },
          }}
        >
          <ShoppingCart sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
        </IconButton>
      </CardActions>
    </Card>
  );
};
