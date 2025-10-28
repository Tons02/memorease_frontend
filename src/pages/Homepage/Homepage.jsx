import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Container,
  Paper,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  LocationOn,
  Phone,
  Email,
  Schedule,
  Nature,
  Security,
  LocalParking,
  AccessibleForward,
  ArrowForward,
  Star,
  Chat,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import background from "../../assets/background.png";
import lotImage from "../../assets/default-image.png";
import aboutBanner from "../../assets/default-image.png";
import cemeteryBanner from "../../assets/cemetery-banner.jpg";
import Slider from "react-slick";
import { useGetLotQuery } from "../../redux/slices/apiLot";
import { useGetCemeteryQuery } from "../../redux/slices/cemeterySlice";

const HomePage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

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
    per_page: "20",
    page: "1",
    pagination: "",
    status: "available",
  });

  // Mock images for gallery - replace with actual cemetery images
  const galleryImages = isCemeteryLoading
    ? [lotImage, lotImage, background, lotImage] // Fallback images while loading
    : [lotImage, lotImage, background, lotCemetery?.data[0]?.profile_picture];

  const features = [
    {
      icon: <Nature />,
      title: "Peaceful Gardens",
      description: "Beautifully landscaped gardens",
    },
    {
      icon: <Security />,
      title: "24/7 Security",
      description: "Round-the-clock protection",
    },
    {
      icon: <LocalParking />,
      title: "Ample Parking",
      description: "Convenient parking spaces",
    },
    {
      icon: <AccessibleForward />,
      title: "Accessible",
      description: "Wheelchair friendly paths",
    },
  ];

  const testimonials = [
    {
      name: "Maria Santos",
      text: "A truly peaceful place with excellent service. The staff was very caring during our difficult time.",
      rating: 5,
    },
    {
      name: "Juan Dela Cruz",
      text: "Beautiful grounds and well-maintained facilities. Highly recommended.",
      rating: 5,
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 1 : 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <>
      {/* Hero Section with Overlay */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 300, md: 500 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        {lotCemetery?.data[0]?.profile_picture?.endsWith(".mp4") ? (
          <video
            src={lotCemetery.data[0].profile_picture}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: -1,
            }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${lotCemetery?.data[0]?.profile_picture})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: isMobile ? "scroll" : "fixed",
              zIndex: -1,
            }}
          />
        )}
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box textAlign="center">
              <Typography
                variant={isMobile ? "h4" : "h2"}
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                }}
              >
                {lotCemetery?.data[0]?.name || "Providence Memorial Parksss"}
              </Typography>
              <Typography
                variant={isMobile ? "body1" : "h6"}
                sx={{
                  mb: 3,
                  maxWidth: 600,
                  mx: "auto",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                }}
              >
                A sacred place of remembrance, offering dignity, peace, and
                comfort to families
              </Typography>
              <Button
                component={RouterLink}
                to="/maps"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "success.main",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  "&:hover": {
                    bgcolor: "success.dark",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
                endIcon={<ArrowForward />}
              >
                Explore Our Lots
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* About Section */}
      <Container sx={{ py: { xs: 4, md: 8 } }}>
        <Grid
          container
          spacing={4}
          alignItems="center"
          sx={{
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          {/* LEFT: Image Gallery — 2 columns from md up */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ order: { xs: 1, md: 1 }, width: "120%" }}
          >
            <Box>
              <Grow in timeout={800}>
                <Card
                  elevation={3}
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* Loading Overlay */}
                  {isCemeteryLoading && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        bgcolor: "rgba(255,255,255,0.8)",
                        zIndex: 10,
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <CircularProgress color="success" />
                        <Typography sx={{ mt: 2, color: "text.secondary" }}>
                          Loading gallery...
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {!isCemeteryLoading &&
                  galleryImages[selectedImage]?.endsWith(".mp4") ? (
                    <Box
                      sx={{
                        width: "100%",
                        height: { xs: "250px", sm: "350px" },
                        bgcolor: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <video
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                      >
                        <source
                          src={galleryImages[selectedImage]}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </Box>
                  ) : (
                    <CardMedia
                      component="img"
                      height={isMobile ? "250" : "350"}
                      image={galleryImages[selectedImage]}
                      alt="Gallery view"
                      sx={{
                        cursor: "pointer",
                        transition: "transform 0.3s ease",
                        "&:hover": { transform: "scale(1.05)" },
                      }}
                    />
                  )}
                </Card>
              </Grow>

              {/* Thumbnail Gallery */}
              <Grid container spacing={1}>
                {galleryImages.slice(1).map((image, index) => (
                  <Grid item xs={4} key={index + 1}>
                    <Card
                      elevation={selectedImage === index + 1 ? 4 : 1}
                      sx={{
                        cursor: "pointer",
                        border:
                          selectedImage === index + 1
                            ? "2px solid #4caf50"
                            : "none",
                        borderRadius: 2,
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        opacity: isCemeteryLoading ? 0.6 : 1,
                        pointerEvents: isCemeteryLoading ? "none" : "auto",
                        "&:hover": {
                          transform: !isCemeteryLoading
                            ? "translateY(-2px)"
                            : "none",
                        },
                      }}
                      onClick={() =>
                        !isCemeteryLoading && setSelectedImage(index + 1)
                      }
                    >
                      {image?.endsWith(".mp4") ? (
                        <Box
                          sx={{
                            width: "175px",
                            height: "100px",
                            bgcolor: "#000",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <video
                            muted
                            playsInline
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          >
                            <source src={image} type="video/mp4" />
                          </video>
                        </Box>
                      ) : (
                        <CardMedia
                          component="img"
                          height="80"
                          style={{
                            width: "160px",
                            height: "100px",
                          }}
                          image={image}
                          alt={`Gallery ${index + 1}`}
                        />
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* RIGHT: About Content — 2 columns from md up */}
          <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 2 } }}>
            <Fade in timeout={1200}>
              <Box>
                <Chip
                  label="About Us"
                  color="success"
                  sx={{ mb: 2, fontSize: "0.9rem" }}
                />
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ fontWeight: "bold", mb: 3 }}
                >
                  {lotCemetery?.data[0]?.name || "Providence Memorial Park"}
                </Typography>

                <Typography
                  variant="body1"
                  paragraph
                  sx={{ lineHeight: 1.8, color: "text.secondary" }}
                >
                  {lotCemetery?.data[0]?.description ||
                    "For over decades, we have been providing a peaceful and dignified resting place for your loved ones. Our beautifully maintained grounds offer a serene environment where families can find comfort and solace."}
                </Typography>

                <Typography
                  variant="body1"
                  paragraph
                  sx={{ lineHeight: 1.8, color: "text.secondary" }}
                >
                  We understand that choosing a final resting place is one of
                  life&apos;s most important decisions. That&apos;s why
                  we&apos;re committed to providing exceptional service and
                  maintaining the highest standards of care for our memorial
                  park.
                </Typography>

                {/* Contact Info */}
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                        <LocationOn color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {lotCemetery?.data[0]?.location ||
                            "Manila, Philippines"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                        <Schedule color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">Open 6AM - 6PM</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: "grey.50", py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 5 }}>
            <Chip label="Our Features" color="success" sx={{ mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
              Why Choose Our Memorial Park
            </Typography>
          </Box>
          <Grid container spacing={3} justifyContent={"center"}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Grow in timeout={800 + index * 200}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      height: "100%",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        elevation: 4,
                        transform: "translateY(-5px)",
                      },
                    }}
                  >
                    <Box sx={{ mb: 2, color: "success.main" }}>
                      {React.cloneElement(feature.icon, {
                        sx: { fontSize: 40 },
                      })}
                    </Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Available Lots Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Box textAlign="center" sx={{ mb: 5 }}>
          <Chip label="Available Now" color="success" sx={{ mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            Available Lots
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Choose from our selection of premium lots in peaceful locations
            throughout our memorial park
          </Typography>
        </Box>

        {isLotLoading ? (
          <Box textAlign="center" sx={{ py: 4 }}>
            <Typography>Loading lots...</Typography>
          </Box>
        ) : lotData?.data?.data?.filter((lot) => lot.status === "available")
            .length === 0 ? (
          <Box textAlign="center" sx={{ py: 4 }}>
            <Typography>No available lots at the moment.</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ "& .slick-dots": { bottom: -50 } }}>
              <Slider {...sliderSettings}>
                {lotData?.data?.data
                  ?.filter((lot) => lot.status === "available")
                  ?.map((lot, index) => (
                    <Box key={lot.id} sx={{ px: { xs: 1, sm: 2 } }}>
                      <Grow in timeout={800 + index * 100}>
                        <Card
                          elevation={2}
                          sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            transition: "all 0.3s ease",
                            height: { xs: 400, sm: 420 },
                            "&:hover": {
                              elevation: 8,
                              transform: "translateY(-5px)",
                            },
                          }}
                        >
                          {lot.lot_image ? (
                            lot.lot_image.match(/\.(mp4|webm|ogg)$/i) ? (
                              <CardMedia
                                component="video"
                                src={lot.lot_image}
                                controls
                                muted
                                autoPlay
                                loop
                                alt={`Lot ${lot.lot_number}`}
                                sx={{
                                  height: { xs: 180, sm: 200 },
                                  width: "100%",
                                  objectFit: "cover",
                                  transition: "transform 0.3s ease",
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                  },
                                }}
                              />
                            ) : (
                              <CardMedia
                                component="img"
                                image={lot.lot_image}
                                alt={`Lot ${lot.lot_number}`}
                                sx={{
                                  height: { xs: 180, sm: 200 },
                                  width: "100%",
                                  objectFit: "cover",
                                  transition: "transform 0.3s ease",
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                  },
                                }}
                              />
                            )
                          ) : (
                            <CardMedia
                              component="img"
                              image={lotImage}
                              alt={`Lot ${lot.lot_number}`}
                              sx={{
                                height: { xs: 180, sm: 200 },
                                width: "100%",
                                objectFit: "cover",
                                transition: "transform 0.3s ease",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                },
                              }}
                            />
                          )}
                          <CardContent
                            sx={{
                              p: { xs: 2, sm: 3 },
                              height: { xs: 220, sm: 220 },
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="start"
                                sx={{ mb: 1 }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: "bold",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: { xs: "180px", sm: "200px" },
                                    pr: 1,
                                  }}
                                  title={`Lot ${lot.lot_number}`}
                                >
                                  Lot {lot.lot_number}
                                </Typography>
                                <Chip
                                  label="Available"
                                  color="success"
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  minHeight: { xs: 36, sm: 40 },
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                }}
                                title={
                                  lot.description ||
                                  "Premium lot in a peaceful location with easy access."
                                }
                              >
                                {lot.description ||
                                  "Premium lot in a peaceful location with easy access."}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="h6"
                                color="success.main"
                                sx={{ fontWeight: "bold", mb: 2 }}
                              >
                                ₱{Number(lot.price).toLocaleString()}
                              </Typography>
                              <Button
                                component={RouterLink}
                                to="/maps"
                                variant="contained"
                                fullWidth
                                sx={{
                                  bgcolor: "success.main",
                                  py: 1.5,
                                  fontWeight: "bold",
                                  "&:hover": {
                                    bgcolor: "success.dark",
                                    transform: "translateY(-1px)",
                                  },
                                  transition: "all 0.3s ease",
                                }}
                                endIcon={<ArrowForward />}
                              >
                                Inquire Now
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grow>
                    </Box>
                  ))}
              </Slider>
            </Box>
          </>
        )}
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: "grey.50", py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 5 }}>
            <Chip label="Testimonials" color="success" sx={{ mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
              What Families Say
            </Typography>
          </Box>
          <Grid container spacing={4} justifyContent="center">
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Fade in timeout={1000 + index * 300}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      borderRadius: 3,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        elevation: 4,
                      },
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} color="warning" />
                      ))}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{ mb: 3, fontStyle: "italic", lineHeight: 1.6 }}
                    >
                      "{testimonial.text}"
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {testimonial.name}
                    </Typography>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Location/Contact Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "60vh", md: "70vh" },
          display: "flex",
          alignItems: "center",
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%), url(${cemeteryBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: isMobile ? "scroll" : "fixed",
          paddingTop: "20px",
          color: "#fff",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
            pointerEvents: "none",
          },
        }}
      >
        {/* Decorative Elements */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
            filter: "blur(40px)",
            display: { xs: "none", md: "block" },
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              {/* Content Card */}
              <Box
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 4,
                  p: { xs: 3, md: 4 },
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* Location Badge */}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    mb: 2,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  <LocationOn sx={{ mr: 1, fontSize: "1rem" }} />
                  {lotCemetery?.data[0]?.location || "Manila, Philippines"}
                </Box>

                <Typography
                  variant="h3"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "2rem", md: "2.5rem" },
                    lineHeight: 1.2,
                    mb: 3,
                  }}
                >
                  Visit Our Memorial Park
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mb: 4,
                    lineHeight: 1.8,
                    opacity: 0.95,
                    fontSize: { xs: "1rem", md: "1.125rem" },
                    maxWidth: "90%",
                  }}
                >
                  {lotCemetery?.data[0]?.description ||
                    "Experience the tranquil beauty of our memorial park. Our caring staff is here to help you find the perfect resting place for your loved ones."}
                </Typography>

                {/* Action Buttons */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mt: 3 }}
                >
                  <Button
                    component={RouterLink}
                    to="/maps-deceased-viewing"
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      color: "#1a1a1a",
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                      "&:hover": {
                        backgroundColor: "#fff",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 25px rgba(0, 0, 0, 0.3)",
                      },
                      transition: "all 0.3s ease",
                    }}
                    endIcon={<LocationOn />}
                  >
                    Get Directions
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      color: "white",
                      borderColor: "rgba(255, 255, 255, 0.8)",
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 500,
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.15)",
                        borderColor: "white",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Contact Us
                  </Button>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              {/* Info Cards */}
              <Stack spacing={2}>
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 3,
                    p: 3,
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Operating Hours
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Monday - Sunday: 6:00 AM - 6:00 PM
                  </Typography>
                </Box>

                <Box
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 3,
                    p: 3,
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    24/7 Support
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Our compassionate team is available around the clock
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>

        {/* Scroll Indicator */}
        <Box
          sx={{
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            alignItems: "center",
            opacity: 0.7,
            animation: "bounce 2s infinite",
          }}
        >
          <Typography variant="caption" sx={{ mb: 1 }}>
            Learn More
          </Typography>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "2px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ↓
          </Box>
        </Box>

        {/* CSS Keyframes for animations */}
        <style jsx>{`
          @keyframes bounce {
            0%,
            20%,
            50%,
            80%,
            100% {
              transform: translateX(-50%) translateY(0);
            }
            40% {
              transform: translateX(-50%) translateY(-10px);
            }
            60% {
              transform: translateX(-50%) translateY(-5px);
            }
          }
        `}</style>
      </Box>
    </>
  );
};

export default HomePage;
