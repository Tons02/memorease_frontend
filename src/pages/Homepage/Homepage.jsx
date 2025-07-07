import React, { useContext } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from "@mui/material";
import background from "../../assets/background.png";
import lotImage from "../../assets/lot-a1.jpg";
import cemeteryBanner from "../../assets/cemetery-banner.jpg";
import Slider from "react-slick"; // <--- Import at top of file
import { useGetLotQuery } from "../../redux/slices/apiLot";
import { useGetCemeteryQuery } from "../../redux/slices/cemeterySlice";

const cemeteryInfo = {
  name: "Providence Memorial Park",
  description: "A peaceful and well-maintained resting place.",
};

const featuredLot = {
  title: "Premium Lot A1",
  description: "Shaded lot near the central monument. Spacious and serene.",
  price: "₱100,000",
  image: lotImage,
};

const HomePage = () => {
  const {
    data: lotCemetery,
    refetch: refetchCemetery,
    isLoading: isCemeteryLoading,
  } = useGetCemeteryQuery({
    search: "",
    pagination: "none",
    status: "active",
  });

  const {
    data: lotData,
    refetch: refetchLots,
    isLoading: isLotLoading,
  } = useGetLotQuery({
    search: "",
    per_page: "8",
    page: "1",
    pagination: "",
    status: "available",
  });

  console.log("lotData", lotData?.data?.data);

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `url(${lotCemetery?.data[0]?.profile_picture})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <Typography
          variant="h3"
          sx={{ bgcolor: "rgba(0,0,0,0.5)", p: 3, borderRadius: 2 }}
        >
          {lotCemetery?.data[0]?.name}
        </Typography>
      </Box>

      {/* Featured Lot */}
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Featured Lot
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={8} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={featuredLot.image}
                alt={featuredLot.title}
              />
              <CardContent>
                <Typography variant="h6">{featuredLot.title}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {featuredLot.description}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {featuredLot.price}
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Inquire Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: 4, pb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Available Lots
        </Typography>

        {isLotLoading ? (
          <Typography>Loading lots...</Typography>
        ) : lotData?.data?.data?.filter((lot) => lot.status === "available")
            .length === 0 ? (
          <Typography>No available lots.</Typography>
        ) : (
          <Slider
            dots={true}
            infinite={true}
            speed={500}
            slidesToShow={4}
            slidesToScroll={1}
            responsive={[
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 1,
                },
              },
            ]}
          >
            {lotData?.data?.data
              ?.filter((lot) => lot.status === "available")
              ?.map((lot) => (
                <Box key={lot.id} sx={{ px: 2 }}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={lot.lot_image || lotImage}
                      alt={`Lot ${lot.lot_number}`}
                    />
                    <CardContent>
                      <Typography variant="h6">{`Lot ${lot.lot_number}`}</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {lot.description ?? "No description available."}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        ₱{lot.price}
                      </Typography>
                      <Button
                        variant="contained"
                        color="success"
                        sx={{ mt: 2 }}
                        fullWidth
                      >
                        Inquire Now
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              ))}
          </Slider>
        )}
      </Box>

      {/* Static Map Background Section */}
      <Box
        sx={{
          backgroundImage: `url(${lotCemetery?.data[0]?.profile_picture})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <Box sx={{ bgcolor: "rgba(0, 0, 0, 0.5)", p: 3, borderRadius: 2 }}>
          <Typography variant="h5">{lotCemetery?.data[0]?.location}</Typography>
          <Typography>
            <Typography variant="h5">
              {lotCemetery?.data[0]?.description}
            </Typography>
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
