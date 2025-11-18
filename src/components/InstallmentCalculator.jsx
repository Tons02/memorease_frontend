import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  TextField,
  Alert,
  AlertTitle,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

const InstallmentCalculator = ({ selectedLot, register }) => {
  const installmentOptions = useMemo(() => {
    if (!selectedLot?.price || !selectedLot?.downpayment_price) {
      return [];
    }

    const remainingBalance = selectedLot.price - selectedLot.downpayment_price;

    return [
      { months: 1, interest: 0, label: "1 month" },
      { months: 3, interest: 0, label: "3 months" },
      { months: 6, interest: 0, label: "6 months" },
      { months: 12, interest: 0, label: "12 months" },
    ].map((option) => {
      const totalWithInterest = remainingBalance * (1 + option.interest);
      const monthlyPayment = totalWithInterest / option.months;

      return {
        ...option,
        monthlyPayment: monthlyPayment.toFixed(2),
        totalAmount: (
          parseFloat(selectedLot.downpayment_price) + totalWithInterest
        ).toFixed(2),
      };
    });
  }, [selectedLot]);

  if (!selectedLot) return null;

  return (
    <Box>
      <TextField
        label="Price"
        fullWidth
        disabled
        margin="normal"
        value={`₱${parseFloat(selectedLot.price).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}`}
      />

      <TextField
        label="Reservation Price"
        fullWidth
        disabled
        margin="normal"
        value={`₱${parseFloat(selectedLot.downpayment_price).toLocaleString(
          "en-PH",
          {
            minimumFractionDigits: 2,
          }
        )}`}
        {...register("total_downpayment_price")}
      />

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Installment Options
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {installmentOptions.map((option) => (
          <Card
            key={option.months}
            sx={{
              border: "1px solid",
              borderColor: "grey.300",
              boxShadow: 1,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {option.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.interest === 0
                      ? "0% interest"
                      : `${option.interest * 100}% interest`}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="h6"
                    color="secondary"
                    sx={{ fontWeight: 700 }}
                  >
                    ₱
                    {parseFloat(option.monthlyPayment).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                    /mo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total: ₱
                    {parseFloat(option.totalAmount).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card
        sx={{
          mt: 1.5,
          bgcolor: "secondary.lighter",
          border: "1px solid",
          borderColor: "secondary.main",
        }}
      >
        <CardContent>
          <Typography
            variant="subtitle2"
            color="secondary"
            sx={{ fontWeight: 600, mb: 1 }}
          >
            Payment Breakdown
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2">Reservation Price:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ₱
              {parseFloat(selectedLot.downpayment_price).toLocaleString(
                "en-PH",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2">Remaining Balance:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ₱
              {(
                selectedLot.price - selectedLot.downpayment_price
              ).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              Total Price:
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: 700 }}
              color="secondary"
            >
              ₱
              {parseFloat(selectedLot.price).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InstallmentCalculator;
