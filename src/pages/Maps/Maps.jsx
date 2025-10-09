import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  Button,
  TextField,
  Autocomplete,
  Box,
  Typography,
  Divider,
  CardMedia,
  IconButton,
  CardContent,
  DialogContent,
  Dialog,
  DialogTitle,
  Checkbox,
  FormControlLabel,
  Link,
  CircularProgress,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { reservationSchema } from "../../validations/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import * as turf from "@turf/turf";
import defaultImage from "../../assets/default-image.png";
import GcashPayment from "../../assets/gcash.png";
import { useGetCemeteryQuery } from "../../redux/slices/cemeterySlice";
import { useGetLotQuery } from "../../redux/slices/apiLot";
import DialogComponent from "../../components/DialogComponent";
import { useAddReservationMutation } from "../../redux/slices/reservationSlice";
import { Link as RouterLink } from "react-router-dom";
import {
  Add,
  Check,
  ChevronLeft,
  ChevronRight,
  Home,
  Info,
} from "@mui/icons-material";
import FileUploadInput from "../../components/FileUploadInput";
import { toast } from "sonner";
import Echo from "laravel-echo";
import { Card } from "stream-chat-react";

const Cemeteries = () => {
  const isLoggedIn = !!localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  const [popupOpen, setPopupOpen] = useState(false);
  const emailVerified = localStorage.getItem("email_verified");
  const mapRef = useRef(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [gcashModalOpen, setGcashModalOpen] = useState(false);
  const [dialogImageIndex, setDialogImageIndex] = useState(0);

  // Helper function to detect video files
  const isVideoFile = (url) => {
    if (!url) return false;

    // Check file extension (works for direct URLs)
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i;
    if (videoExtensions.test(url)) return true;

    // Check MIME type if available (for blob URLs or data URLs)
    if (url.startsWith("blob:") || url.startsWith("data:video")) return true;

    // Check the URL path without query params
    const urlWithoutParams = url.split("?")[0];
    return videoExtensions.test(urlWithoutParams);
  };

  const nextDialogImage = () => {
    if (selectedLot) {
      const images = getDisplayMedia(selectedLot);
      setDialogImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevDialogImage = () => {
    if (selectedLot) {
      const images = getDisplayMedia(selectedLot);
      setDialogImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const downloadGcashImage = () => {
    const link = document.createElement("a");
    link.href = GcashPayment;
    link.download = "PMP-GCASH-Payment-Details.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nextImage = (lotId) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [lotId]:
        ((prev[lotId] || 0) + 1) %
        getDisplayMedia(lotData?.data?.find((lot) => lot.id === lotId)).length,
    }));
  };

  const prevImage = (lotId) => {
    const images = getDisplayMedia(
      lotData?.data?.find((lot) => lot.id === lotId)
    );
    setCurrentImageIndex((prev) => ({
      ...prev,
      [lotId]: ((prev[lotId] || 0) - 1 + images.length) % images.length,
    }));
  };

  const getDisplayMedia = (lot) => {
    const media = [
      lot.lot_image,
      lot.second_lot_image,
      lot.third_lot_image,
      lot.fourth_lot_image,
    ].filter((file) => file && file !== null);

    return media.length > 0 ? media : [defaultImage];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "success";
      case "reserved":
        return "warning";
      case "sold":
        return "error";
      case "land_mark":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return "🟢"; // Green circle
      case "reserved":
        return "🟡"; // Yellow circle
      case "sold":
        return "🔴"; // Red circle
      case "land_mark":
        return "🔵"; // Blue circle (landmark)
      default:
        return "⚪"; // White circle
    }
  };

  useEffect(() => {
    const channel = window.Echo.channel("lots").listen(".LotReserved", (e) => {
      console.log("Lot reserved update received:", e);
      refetchLots();
    });

    return () => {
      channel.stopListening(".LotReserved");
    };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    inputError,
    setError,
    control,
    formState: { errors },
  } = useForm({ resolver: yupResolver(reservationSchema) });

  const {
    data: lotData,
    isLoading: isLotLoading,
    refetch: refetchLots,
  } = useGetLotQuery({
    search: "",
    pagination: "none",
  });

  const { data: cemeteryData } = useGetCemeteryQuery();
  const [addReservation, { isLoading: isReservationLoading }] =
    useAddReservationMutation();

  function cleanPointer(pointer) {
    return pointer?.replace(/^\//, "");
  }

  const center = cemeteryData?.data?.[0]?.coordinates ?? [
    14.288794, 120.970325,
  ];

  const handleReservation = async (data) => {
    console.log("data", data);

    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const response = await addReservation(formData).unwrap();
      refetchLots();
      setSelectedLot(null);
      setOpenDialog(false);
      setValue("proof_of_payment", "");
      setValue("lot_id", data.lot_id);
      setValue("downpayment_price", data.downpayment_price);
      toast.success(response?.message);
    } catch (error) {
      error?.data?.errors.map(
        (inputError, index) => toast.error(error?.data?.errors[0].detail),
        setError(cleanPointer(inputError?.source?.pointer), {
          type: "message",
          message: inputError?.detail,
        })
      );
    }
  };

  const flyToLot = (lot) => {
    const map = mapRef.current;
    if (!map || !lot?.coordinates?.length) return;

    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    const reversedCoords = lot.coordinates.map(([lat, lng]) => [lng, lat]);

    const lotPolygon = turf.polygon([[...reversedCoords, reversedCoords[0]]]);
    const center = turf.center(lotPolygon).geometry.coordinates;
    const [lng, lat] = center;

    map.flyTo([lat, lng], 18, {
      animate: true,
      duration: 2,
    });

    const marker = L.circleMarker([lat, lng], {
      radius: 10,
      color: "blue",
      fillColor: "#00f",
      fillOpacity: 0.6,
    }).addTo(map);

    map.once("moveend", () => {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    });

    setTimeout(() => map.removeLayer(marker), 3000);
  };

  const MapRefHandler = ({ setMap }) => {
    const map = useMap();

    useEffect(() => {
      setMap(map);
    }, [map]);

    return null;
  };

  function PopupEventHandler() {
    useMapEvents({
      popupopen: () => setPopupOpen(true),
      popupclose: () => setPopupOpen(false),
    });
    return null;
  }

  const [isCheckTerm, setIsCheckTerm] = useState(false);

  return (
    <>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" sx={{ mr: 2 }}>
            Map Cemetery
          </Typography>
        </Box>
        {isLotLoading ? (
          <CircularProgress
            color="secondary"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
              left: "50%",
            }}
          />
        ) : (
          <div style={{ height: "70vh", width: "100%" }}>
            <MapContainer
              center={center}
              zoom={18}
              maxZoom={19}
              style={{ height: "100%" }}
            >
              <Autocomplete
                options={lotData?.data || []}
                getOptionLabel={(option) => option.lot_number || ""}
                onChange={(event, selectedLot) => {
                  console.log("Selected Lot:", selectedLot);
                  if (selectedLot) {
                    flyToLot(selectedLot);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Lot"
                    variant="outlined"
                    size="small"
                    sx={{
                      backgroundColor: "transparent",
                    }}
                  />
                )}
                sx={{
                  position: "absolute",
                  top: 10,
                  left: 50,
                  zIndex: 1000,
                  backgroundColor: "#fff",
                  width: 200,
                }}
              />
              {!popupOpen && !openDialog && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    zIndex: 1000,
                    backgroundColor: "#fff",
                    padding: 2,
                    borderRadius: 2,
                    boxShadow: 3,
                    fontSize: 14,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    MAP LEGENDS
                  </Typography>
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <Box
                      width={16}
                      height={16}
                      bgcolor="#15803d"
                      borderRadius="50%"
                      mr={1}
                    />
                    Available Lot
                  </Box>
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <Box
                      width={16}
                      height={16}
                      bgcolor="yellow"
                      borderRadius="50%"
                      mr={1}
                    />
                    Reserved Lot
                  </Box>
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <Box
                      width={16}
                      height={16}
                      bgcolor="red"
                      borderRadius="50%"
                      mr={1}
                    />
                    Sold Lot
                  </Box>
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <Box
                      width={16}
                      height={16}
                      bgcolor="blue"
                      borderRadius="50%"
                      mr={1}
                    />
                    Landmark
                  </Box>
                  {/* Your content here */}
                </Box>
              )}
              <MapRefHandler
                setMap={(mapInstance) => (mapRef.current = mapInstance)}
              />
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              {lotData?.data?.map((lot) => (
                <Polygon
                  key={lot.id}
                  positions={lot.coordinates}
                  pathOptions={{
                    color:
                      lot.status === "available"
                        ? "#15803d"
                        : lot.status === "reserved"
                        ? "#ffcc00"
                        : lot.status === "sold"
                        ? "red"
                        : lot.status === "land_mark"
                        ? "#1e40af"
                        : "gray",
                    fillOpacity: 0.5,
                  }}
                >
                  <PopupEventHandler />
                  <Popup maxWidth={350}>
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: "320px",
                        minWidth: "250px",
                        backgroundColor: "white",
                        borderRadius: 2,
                        boxShadow: 3,
                        overflow: "hidden",
                      }}
                    >
                      {/* Enhanced Image/Video Section */}
                      <Box sx={{ position: "relative" }}>
                        {(() => {
                          const images = getDisplayMedia(lot);
                          const currentIndex = currentImageIndex[lot.id] || 0;
                          const currentMedia = images[currentIndex];
                          const isVideo = isVideoFile(currentMedia);

                          return isVideo ? (
                            <Box
                              component="video"
                              src={currentMedia}
                              controls
                              autoPlay={false}
                              muted
                              sx={{
                                width: "100%",
                                height: "180px",
                                objectFit: "contain",
                                backgroundColor: "#000",
                              }}
                              onError={(e) => {
                                console.error(
                                  "Video failed to load:",
                                  currentMedia
                                );
                                console.error("Error details:", e);
                              }}
                            />
                          ) : (
                            <Box
                              component="img"
                              src={currentMedia}
                              alt={`Lot ${lot.lot_number}`}
                              sx={{
                                width: "100%",
                                height: "180px",
                                objectFit: "contain",
                                backgroundColor: "#f5f5f5",
                              }}
                              onError={(e) => {
                                console.error(
                                  "Image failed to load:",
                                  currentMedia
                                );
                              }}
                            />
                          );
                        })()}

                        {/* Image/Video Navigation - Only show if more than 1 media */}
                        {(() => {
                          const images = getDisplayMedia(lot);
                          if (images.length > 1) {
                            return (
                              <>
                                <IconButton
                                  sx={{
                                    position: "absolute",
                                    left: 8,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    color: "white",
                                    "&:hover": {
                                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    },
                                    width: 32,
                                    height: 32,
                                  }}
                                  onClick={() => prevImage(lot.id)}
                                  size="small"
                                >
                                  <ChevronLeft fontSize="small" />
                                </IconButton>

                                <IconButton
                                  sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    color: "white",
                                    "&:hover": {
                                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    },
                                    width: 32,
                                    height: 32,
                                  }}
                                  onClick={() => nextImage(lot.id)}
                                  size="small"
                                >
                                  <ChevronRight fontSize="small" />
                                </IconButton>

                                {/* Media Counter */}
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                                    color: "white",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {(currentImageIndex[lot.id] || 0) + 1} /{" "}
                                  {images.length}
                                </Box>

                                {/* Media Indicators */}
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 8,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    display: "flex",
                                    gap: 0.5,
                                  }}
                                >
                                  {images.map((_, index) => (
                                    <Box
                                      key={index}
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        backgroundColor:
                                          index ===
                                          (currentImageIndex[lot.id] || 0)
                                            ? "white"
                                            : "rgba(255, 255, 255, 0.5)",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                      }}
                                      onClick={() =>
                                        setCurrentImageIndex((prev) => ({
                                          ...prev,
                                          [lot.id]: index,
                                        }))
                                      }
                                    />
                                  ))}
                                </Box>
                              </>
                            );
                          }
                          return null;
                        })()}
                      </Box>

                      {/* Content Section */}
                      <Box sx={{ p: 1 }}>
                        {/* Header with Lot Number and Status */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              fontSize: "1.1rem",
                              fontWeight: "bold",
                            }}
                          >
                            <Home fontSize="small" color="secondary" />
                            {lot.lot_number}
                          </Typography>
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 2,
                              backgroundColor:
                                lot.status === "available"
                                  ? "#15803d" // green
                                  : lot.status === "reserved"
                                  ? "#f59e0b" // yellow-orange
                                  : lot.status === "sold"
                                  ? "#dc2626" // red
                                  : lot.status === "land_mark"
                                  ? "#1e40af" // blue for landmark
                                  : "gray", // fallback
                              color: "white",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            {getStatusIcon(lot.status)}{" "}
                            {lot.status === "land_mark"
                              ? "LANDMARK"
                              : lot.status?.toUpperCase()}
                          </Box>
                        </Box>

                        {/* Description */}
                        {lot.description && (
                          <Box sx={{ mb: 1.5 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                                fontSize: "0.875rem",
                              }}
                            >
                              <Info fontSize="small" sx={{ mt: 0.1 }} />
                              <span>{lot.description}</span>
                            </Typography>
                          </Box>
                        )}

                        <Divider />

                        {/* Pricing Information */}
                        {lot.is_land_mark == "0" && (
                          <Box
                            sx={{
                              padding: 0,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "medium",
                                  margin: 0,
                                }}
                              >
                                💰 Total Price:
                              </Typography>
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ fontSize: "1.1rem" }}
                              >
                                ₱{Number(lot.price).toLocaleString()}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "medium" }}
                              >
                                💳 Down Payment:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{
                                  fontSize: "1rem",
                                }}
                              >
                                ₱
                                {Number(lot.downpayment_price).toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Action Button */}
                        {lot.status === "available" && isLoggedIn && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            {emailVerified !== null && (
                              <Button
                                variant="contained"
                                color={emailVerified ? "success" : "warning"}
                                size="medium"
                                onClick={() => {
                                  if (emailVerified) {
                                    setSelectedLot(lot);
                                    setOpenDialog(true);
                                  }
                                }}
                                disabled={!emailVerified}
                                sx={{
                                  px: 3,
                                  py: 1,
                                  borderRadius: 2,
                                  fontWeight: "bold",
                                  boxShadow: 2,
                                  "&:hover": {
                                    boxShadow: emailVerified ? 4 : 2,
                                    transform: emailVerified
                                      ? "translateY(-1px)"
                                      : "none",
                                  },
                                  transition: "all 0.2s ease-in-out",
                                }}
                              >
                                {emailVerified
                                  ? "View"
                                  : "Please verify your email first"}
                              </Button>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Popup>
                </Polygon>
              ))}
            </MapContainer>
            <div
              style={{
                position: "absolute",
                top: 100,
                left: 150,
                zIndex: 1000,
              }}
            ></div>
          </div>
        )}
      </Box>

      <DialogComponent
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setDialogImageIndex(0);
          setIsCheckTerm(false);
        }}
        onSubmit={handleSubmit(handleReservation)}
        title={"Reserve Lot"}
        icon={<Add color="secondary" />}
        isLoading={isReservationLoading}
        submitIcon={<Check />}
        submitLabel={"Confirm"}
        formMethods={{ handleSubmit, reset }}
        isValid={true}
        isDirty={true}
        isCheckTerm={isCheckTerm}
        isArchived={true}
      >
        <TextField
          label="Lot Number"
          fullWidth
          margin="normal"
          {...register("lot_id")}
          value={selectedLot?.id}
          sx={{ display: "none" }}
        />

        {/* Enhanced Lot Media Slider Section */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Lot Media
          </Typography>

          <Box sx={{ position: "relative", width: "90%" }}>
            {(() => {
              if (selectedLot) {
                const media = getDisplayMedia(selectedLot);
                const currentMedia = media[dialogImageIndex] || defaultImage;
                const isVideo = isVideoFile(currentMedia);

                return isVideo ? (
                  <Box
                    component="video"
                    src={currentMedia}
                    controls
                    autoPlay={false}
                    muted
                    sx={{
                      width: "100%",
                      height: "200px",
                      objectFit: "contain",
                      backgroundColor: "#000",
                      borderRadius: 1,
                    }}
                    onError={(e) => {
                      console.error("Video failed to load:", currentMedia);
                      console.error("Error details:", e);
                    }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={currentMedia}
                    alt="Lot Media"
                    sx={{
                      width: "100%",
                      height: "200px",
                      objectFit: "contain",
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                    }}
                    onError={(e) => {
                      console.error("Image failed to load:", currentMedia);
                    }}
                  />
                );
              }
              return (
                <Box
                  component="img"
                  src={defaultImage}
                  alt="Default Lot Media"
                  sx={{
                    width: "100%",
                    height: "200px",
                    objectFit: "contain",
                    backgroundColor: "#f5f5f5",
                    borderRadius: 1,
                  }}
                />
              );
            })()}

            {/* Navigation arrows - only show if multiple media */}
            {selectedLot &&
              (() => {
                const media = getDisplayMedia(selectedLot);
                if (media.length > 1) {
                  return (
                    <>
                      <IconButton
                        onClick={prevDialogImage}
                        sx={{
                          position: "absolute",
                          left: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          color: "white",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                          width: 36,
                          height: 36,
                        }}
                      >
                        <ChevronLeft />
                      </IconButton>

                      <IconButton
                        onClick={nextDialogImage}
                        sx={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          color: "white",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                          width: 36,
                          height: 36,
                        }}
                      >
                        <ChevronRight />
                      </IconButton>

                      {/* Media counter */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          color: "white",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                        }}
                      >
                        {dialogImageIndex + 1} / {media.length}
                      </Box>
                    </>
                  );
                }
                return null;
              })()}

            {/* Media dots indicators */}
            {selectedLot &&
              (() => {
                const media = getDisplayMedia(selectedLot);
                if (media.length > 1) {
                  return (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      {media.map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor:
                              index === dialogImageIndex ? "#1976d2" : "#ccc",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": {
                              backgroundColor:
                                index === dialogImageIndex ? "#1976d2" : "#999",
                            },
                          }}
                          onClick={() => setDialogImageIndex(index)}
                        />
                      ))}
                    </Box>
                  );
                }
                return null;
              })()}
          </Box>
        </Box>

        <TextField
          label="Lot Number"
          fullWidth
          margin="normal"
          disabled
          value={selectedLot?.lot_number}
        />
        <TextField
          label="Description"
          fullWidth
          disabled
          margin="normal"
          value={selectedLot?.description}
        />
        <TextField
          label="Status"
          fullWidth
          disabled
          margin="normal"
          value={selectedLot?.status}
        />
        <TextField
          label="Price"
          fullWidth
          disabled
          margin="normal"
          value={selectedLot?.price}
        />
        <TextField
          label="Downpayment_price"
          fullWidth
          disabled
          margin="normal"
          value={selectedLot?.downpayment_price}
          {...register("total_downpayment_price")}
        />

        {/* Enhanced GCash Section */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            PMP GCASH Payment Details
          </Typography>

          <Box
            sx={{
              position: "relative",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: 3,
              },
              border: "2px solid #e0e0e0",
              borderRadius: 2,
              p: 1,
              backgroundColor: "#f9f9f9",
            }}
            onClick={() => setGcashModalOpen(true)}
          >
            <Box
              component="img"
              src={GcashPayment}
              alt="GCASH Payment Details"
              sx={{
                width: "100%",
                height: "250px",
                objectFit: "contain",
              }}
            />

            {/* Click indicator overlay */}
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(25, 118, 210, 0.8)",
                color: "white",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.75rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              🔍 Click to enlarge
            </Box>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, fontStyle: "italic" }}
          >
            Click image to view in full size and download
          </Typography>
        </Box>
        <Divider />
        <Controller
          name="proof_of_payment"
          control={control}
          defaultValue={null}
          render={({ field }) => (
            <FileUploadInput
              title="Proof of Payment"
              name="proof_of_payment"
              value={field.value}
              onChange={field.onChange}
              setValue={setValue}
              previousImageUrl={defaultImage}
              error={!!errors.proof_of_payment}
              helperText={errors.proof_of_payment?.message}
            />
          )}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isCheckTerm}
              onChange={(e) => setIsCheckTerm(e.target.checked)}
              color="seconday"
            />
          }
          label={
            <Typography variant="body2">
              By checking the checkbox you will agree to the{" "}
              <Link
                component={RouterLink}
                target="_blank"
                rel="noopener noreferrer"
                to="/terms"
                underline="hover"
                color="secondary"
              >
                Terms and Agreement
              </Link>{" "}
              of Providence Memorial Park
            </Typography>
          }
        />
      </DialogComponent>

      {/* GCash Image Modal */}
      <Dialog
        open={gcashModalOpen}
        onClose={() => setGcashModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
          GCash Payment Details
        </DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            sx={{ p: 2 }}
          >
            <Box
              component="img"
              src={GcashPayment}
              alt="GCASH Payment Details - Full Size"
              sx={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
              }}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                color="success"
                onClick={downloadGcashImage}
                sx={{
                  px: 3,
                  py: 1,
                  fontWeight: "bold",
                }}
              >
                📥 Download Image
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={() => setGcashModalOpen(false)}
                sx={{ px: 3, py: 1 }}
              >
                Close
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cemeteries;
