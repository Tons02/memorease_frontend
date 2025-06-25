import React from "react";
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
  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `url(${cemeteryBanner})`,
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
          {cemeteryInfo.name}
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
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ px: 2 }}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={lotImage}
                  alt={`Lot ${i}`}
                />
                <CardContent>
                  <Typography variant="h6">{`Lot ${i}`}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Spacious lawn lot with great location.
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ₱{100000 + i * 5000}
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
      </Box>

      {/* Static Map Background Section */}
      <Box
        sx={{
          backgroundImage: `url(${background})`,
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
          <Typography variant="h5">Our Location</Typography>
          <Typography>
            Visit our site to explore available lots in person
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
