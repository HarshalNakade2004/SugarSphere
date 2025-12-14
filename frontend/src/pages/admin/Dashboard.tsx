import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  TrendingUp,
  ShoppingCart,
  People,
  AttachMoney,
  Inventory,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics";
import type { Order } from "@/types";

export const AdminDashboard = () => {
  const [period, setPeriod] = useState("week");

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: analyticsApi.getStats,
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["admin-revenue", period],
    queryFn: () => analyticsApi.getRevenue(period),
  });

  const { data: topSweetsData, isLoading: topSweetsLoading } = useQuery({
    queryKey: ["admin-top-sweets"],
    queryFn: () => analyticsApi.getTopSweets(5),
  });

  const { data: recentOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: analyticsApi.getRecentOrders,
  });

  const stats = statsData?.data;
  const topSweets = topSweetsData?.data || [];
  const recentOrders = recentOrdersData?.data || [];

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString() || "0"}`,
      icon: <AttachMoney />,
      color: "#4caf50",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: <ShoppingCart />,
      color: "#2196f3",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: <People />,
      color: "#ff9800",
    },
    {
      title: "Total Products",
      value: stats?.totalSweets || 0,
      icon: <Inventory />,
      color: "#9c27b0",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {card.title}
                    </Typography>
                    {statsLoading ? (
                      <Skeleton width={100} height={40} />
                    ) : (
                      <Typography variant="h4" fontWeight={600}>
                        {card.value}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      bgcolor: `${card.color}20`,
                      borderRadius: 2,
                      p: 1.5,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Revenue Overview</Typography>
              <TextField
                select
                size="small"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </TextField>
            </Box>

            {revenueLoading ? (
              <Skeleton variant="rectangular" height={200} />
            ) : (
              <Box
                sx={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <TrendingUp
                    sx={{ fontSize: 60, color: "success.main", mb: 1 }}
                  />
                  <Typography
                    variant="h4"
                    fontWeight={600}
                    color="success.main"
                  >
                    ₹{revenueData?.data?.total?.toLocaleString() || "0"}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Revenue (
                    {period === "week"
                      ? "Last 7 Days"
                      : period === "month"
                      ? "Last 30 Days"
                      : "This Year"}
                    )
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Top Selling Sweets */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Sweets
            </Typography>

            {topSweetsLoading ? (
              [...Array(5)].map((_, idx) => (
                <Skeleton key={idx} height={50} sx={{ mb: 1 }} />
              ))
            ) : (
              <Box>
                {topSweets.map((sweet: any, index: number) => (
                  <Box
                    key={sweet._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      py: 1.5,
                      borderBottom:
                        index < topSweets.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        width: 30,
                        color: index < 3 ? "primary.main" : "text.secondary",
                        fontWeight: 600,
                      }}
                    >
                      #{index + 1}
                    </Typography>
                    <Box sx={{ flexGrow: 1, ml: 1 }}>
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {sweet.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sweet.totalQuantity || sweet.soldCount || 0} sold
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      ₹
                      {(
                        sweet.totalRevenue ||
                        sweet.revenue ||
                        0
                      )?.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ordersLoading ? (
                    [...Array(5)].map((_, idx) => (
                      <TableRow key={idx}>
                        {[...Array(6)].map((_, cellIdx) => (
                          <TableCell key={cellIdx}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No orders yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((order: Order) => (
                      <TableRow key={order._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            #{order._id.slice(-8).toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.user?.name || "Unknown"}</TableCell>
                        <TableCell>{order.items.length} items</TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>
                            ₹{order.totalAmount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)
                            }
                            size="small"
                            color={
                              order.status === "delivered"
                                ? "success"
                                : order.status === "cancelled" ||
                                  order.status === "failed"
                                ? "error"
                                : "primary"
                            }
                          />
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
