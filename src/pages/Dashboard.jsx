import { useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle,
  PendingActions,
  Cancel,
  ReportProblem,
} from "@mui/icons-material";
import {
  useGetReservationCountsQuery,
  useGetReservationSalesQuery,
} from "../redux/slices/reservationSlice";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Dashboard = () => {
  // Queries for stat cards
  const {
    data: approvedData,
    isLoading: approvedLoading,
    refetch: refetchApproved,
  } = useGetReservationCountsQuery({ status: "approved" });

  const {
    data: pendingData,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = useGetReservationCountsQuery({ status: "pending" });

  const {
    data: rejectedData,
    isLoading: rejectedLoading,
    refetch: refetchRejected,
  } = useGetReservationCountsQuery({ status: "rejected" });

  const {
    data: canceledData,
    isLoading: canceledLoading,
    refetch: refetchCanceled,
  } = useGetReservationCountsQuery({ status: "canceled" });

  // Query for chart
  const {
    data: salesData,
    isLoading: salesLoading,
    refetch: refetchSales,
  } = useGetReservationSalesQuery({
    start_date: "2025-08-01",
    end_date: "2025-08-31",
  });

  // WebSocket integration
  useEffect(() => {
    const channel = window.Echo.channel("lots").listen(".LotReserved", (e) => {
      console.log("Lot reserved update received:", e);
      refetchApproved();
      refetchPending();
      refetchRejected();
      refetchCanceled();
      refetchSales();
    });

    return () => {
      channel.stopListening(".LotReserved");
    };
  }, [
    refetchApproved,
    refetchPending,
    refetchRejected,
    refetchCanceled,
    refetchSales,
  ]);

  const statCards = [
    {
      title: "Approved Reservations",
      value: approvedData?.data ?? 0,
      icon: <CheckCircle sx={{ fontSize: 40, color: "success.main" }} />,
      loading: approvedLoading,
      color: "success.main",
    },
    {
      title: "Pending Reservations",
      value: pendingData?.data ?? 0,
      icon: <PendingActions sx={{ fontSize: 40, color: "warning.main" }} />,
      loading: pendingLoading,
      color: "warning.main",
    },
    {
      title: "Rejected Reservations",
      value: rejectedData?.data ?? 0,
      icon: <ReportProblem sx={{ fontSize: 40, color: "error.main" }} />,
      loading: rejectedLoading,
      color: "error.main",
    },
    {
      title: "Canceled Reservations",
      value: canceledData?.data ?? 0,
      icon: <Cancel sx={{ fontSize: 40, color: "text.secondary" }} />,
      loading: canceledLoading,
      color: "text.secondary",
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                p: 2,
                transition: "all 0.3s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ mr: 2 }}>{card.icon}</Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {card.title}
                  </Typography>
                  {card.loading ? (
                    <CircularProgress
                      size={24}
                      sx={{ mt: 1, color: card.color }}
                    />
                  ) : (
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: card.color }}
                    >
                      {card.value}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sales Chart in a Card */}
      <Box mt={4}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            p: 3,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Reservation Sales Overview
          </Typography>

          {salesLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height={300}
            >
              <CircularProgress />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData?.data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_sales"
                  stroke="#15803d"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
