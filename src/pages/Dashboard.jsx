import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormHelperText,
  CircularProgress,
  TextField,
  Button,
} from "@mui/material";
import {
  CheckCircle,
  PendingActions,
  Cancel,
  ReportProblem,
  Check,
  Add,
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
import { cemeterySchema } from "../validations/validation";
import { Controller, useForm } from "react-hook-form";
import {
  useGetCemeteryQuery,
  useUpdateCemeteryMutation,
} from "../redux/slices/cemeterySlice";
import { yupResolver } from "@hookform/resolvers/yup";
import DialogComponent from "../components/DialogComponent";
import FileUploadInput from "../components/FileUploadInput";
import { toast } from "sonner";

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
  const today = new Date();

  // Get the first day of the current month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Get the last day of the current month
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Format dates as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split("T")[0];

  const {
    data: salesData,
    isLoading: salesLoading,
    refetch: refetchSales,
  } = useGetReservationSalesQuery({
    start_date: formatDate(startOfMonth),
    end_date: formatDate(endOfMonth),
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

  const [openCemeteryInformation, setOpenCemeteryInformation] = useState(false);

  const {
    register: cemeteryRegister,
    handleSubmit: handleCemeterySubmit,
    reset: resetCemeteryForm,
    setValue: cemeterySetValue,
    control,
    errors,
    formState: { errors: cemeteryErrors },
  } = useForm({ resolver: yupResolver(cemeterySchema) });

  const { data: cemeteryData, isLoading: isGetLoadingCemetery } =
    useGetCemeteryQuery();
  const [updateCemetery, { isLoading: isUpdateCemetery }] =
    useUpdateCemeteryMutation();
  console.log("Cemetery Data:", cemeteryData?.data?.[0]?.profile_picture);
  const onSubmitCemeteryUpdate = async (data) => {
    try {
      const cemeteryId = cemeteryData?.data?.[0]?.id;

      console.log("Submitted profile_picture:", data.profile_picture);
      console.log("Is File:", data.profile_picture instanceof File);
      if (!cemeteryId) return;

      const formData = new FormData();
      formData.append("_method", "PATCH");
      formData.append("name", data?.name || "");
      formData.append("description", data?.description || "");
      formData.append("location", data?.location || "");
      // ✅ Only append file if it exists
      if (data.profile_picture) {
        formData.append("profile_picture", data.profile_picture);
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      await updateCemetery({ id: cemeteryId, formData }).unwrap();
      toast.success("Cemetery info updated successfully");
      setOpenCemeteryInformation(false);
    } catch (err) {
      toast.error("Failed to update cemetery info");
    }
  };

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
    <>
      <Box>
        {/* Page Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
        >
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Admin Dashboard
          </Typography>
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={() => setOpenCemeteryInformation(true)}
            sx={{ mt: 1 }}
            disabled={isGetLoadingCemetery}
          >
            {isGetLoadingCemetery ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Cemetery Information"
            )}
          </Button>
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
      <DialogComponent
        open={openCemeteryInformation}
        onClose={() => setOpenCemeteryInformation(false)}
        onSubmit={onSubmitCemeteryUpdate}
        title={"Cemetery Information"}
        icon={<Add color="secondary" />}
        isLoading={isUpdateCemetery}
        submitIcon={<Check />}
        submitLabel={"Update"}
        formMethods={{ handleSubmit: handleCemeterySubmit }}
        isValid={true}
        isDirty={true}
      >
        <Controller
          name="profile_picture"
          control={control}
          defaultValue={null}
          render={({ field }) => (
            <FileUploadInput
              title="Cemetery"
              name={field.name}
              value={field.value}
              setValue={cemeterySetValue}
              onChange={field.onChange}
              previousImageUrl={
                cemeteryData?.data?.[0]?.profile_picture ?? null
              }
            />
          )}
        />

        <FormHelperText error>
          {cemeteryErrors.profile_picture?.message}
        </FormHelperText>
        <Controller
          name="name"
          control={control}
          defaultValue={cemeteryData?.data?.[0]?.name || ""}
          render={({ field }) => (
            <TextField
              label="Name"
              type="text"
              fullWidth
              margin="normal"
              {...field}
              error={!!cemeteryErrors.name}
              helperText={cemeteryErrors.name?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          defaultValue={cemeteryData?.data?.[0]?.description || ""}
          render={({ field }) => (
            <TextField
              label="Description"
              type="text"
              fullWidth
              margin="normal"
              {...field}
              error={!!cemeteryErrors.description}
              helperText={cemeteryErrors.description?.message}
            />
          )}
        />

        <Controller
          name="location"
          control={control}
          defaultValue={cemeteryData?.data?.[0]?.location || ""}
          render={({ field }) => (
            <TextField
              label="Location"
              type="text"
              fullWidth
              margin="normal"
              {...field}
              error={!!cemeteryErrors.location}
              helperText={cemeteryErrors.location?.message}
            />
          )}
        />
      </DialogComponent>
    </>
  );
};

export default Dashboard;
