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
  const emailVerified = localStorage.getItem("email_verified");
  const mapRef = useRef(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [gcashModalOpen, setGcashModalOpen] = useState(false);
  const [dialogImageIndex, setDialogImageIndex] = useState(0);

  const nextDialogImage = () => {
    if (selectedLot) {
      const images = getDisplayImages(selectedLot);
      setDialogImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevDialogImage = () => {
    if (selectedLot) {
      const images = getDisplayImages(selectedLot);
      setDialogImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Add this function to handle GCash image download:
  const downloadGcashImage = () => {
    const link = document.createElement("a");
    link.href = GcashPayment;
    link.download = "PMP-GCASH-Payment-Details.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper functions (add these in your component)
  const nextImage = (lotId) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [lotId]:
        ((prev[lotId] || 0) + 1) %
        getDisplayImages(lotData?.data?.find((lot) => lot.id === lotId)).length,
    }));
  };

  const prevImage = (lotId) => {
    const images = getDisplayImages(
      lotData?.data?.find((lot) => lot.id === lotId)
    );
    setCurrentImageIndex((prev) => ({
      ...prev,
      [lotId]: ((prev[lotId] || 0) - 1 + images.length) % images.length,
    }));
  };

  const getDisplayImages = (lot) => {
    const images = [
      lot.lot_image,
      lot.second_lot_image,
      lot.third_lot_image,
      lot.fourth_lot_image,
    ].filter((img) => img && img !== null);
    return images.length > 0 ? images : [defaultImage];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "success";
      case "reserved":
        return "warning";
      case "sold":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return "🟢";
      case "reserved":
        return "🟡";
      case "sold":
        return "🔴";
      default:
        return "⚪";
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

  const { data: lotData, refetch: refetchLots } = useGetLotQuery({
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
        // Only append if value is not null or undefined
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

    // Flip [lat, lng] to [lng, lat] for turf
    const reversedCoords = lot.coordinates.map(([lat, lng]) => [lng, lat]);

    const lotPolygon = turf.polygon([[...reversedCoords, reversedCoords[0]]]);
    const center = turf.center(lotPolygon).geometry.coordinates; // [lng, lat]
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

  return (
    <>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" sx={{ mr: 2 }}>
            Map Cemetery
          </Typography>
        </Box>

        <div style={{ height: "70vh", width: "100%" }}>
          <MapContainer center={center} zoom={50} style={{ height: "100%" }}>
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
                    backgroundColor: "transparent", // input field background
                  }}
                />
              )}
              sx={{
                position: "absolute",
                top: 10,
                left: 50,
                zIndex: 1000,
                backgroundColor: "#fff",
                width: 150,
              }}
            />
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
            </Box>
            <MapRefHandler
              setMap={(mapInstance) => (mapRef.current = mapInstance)}
            />
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                      ? "orange"
                      : "red",
                  fillOpacity: 0.5,
                }}
              >
                {/* <Popup>
                  <Box
                    component="img"
                    src={lot.lot_image ?? defaultImage}
                    alt=""
                    sx={{
                      width: "200px",
                      height: "150",
                      alignItems: "center",
                    }}
                  />
                  <br />
                  <strong>Lot Name: </strong>
                  {lot.lot_number}
                  <br />
                  <strong>Description: </strong>
                  {lot.description}
                  <br />
                  <strong>Status: </strong>
                  {lot.status}
                  <br />
                  <strong>Price: </strong>₱{lot.price}
                  <br />
                  <strong>Downpayment: </strong>₱{lot.downpayment_price}
                  <br />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 1, // spacing between buttons (theme-based)
                      mt: 1, // margin top
                    }}
                  >
                    {lot.status === "available" && isLoggedIn && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => {
                          setSelectedLot(lot);
                          setOpenDialog(true);
                        }}
                        style={{ marginTop: 8, marginRight: 5 }}
                      >
                        Reserve
                      </Button>
                    )}
                  </Box>
                </Popup> */}

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
                    {/* Enhanced Image Section */}
                    <Box sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={(() => {
                          const images = getDisplayImages(lot);
                          const currentIndex = currentImageIndex[lot.id] || 0;
                          return images[currentIndex];
                        })()}
                        alt={`Lot ${lot.lot_number}`}
                        sx={{
                          width: "100%",
                          height: "180px",
                          objectFit: "contain",
                          backgroundColor: "#f5f5f5",
                        }}
                      />

                      {/* Image Navigation - Only show if more than 1 image */}
                      {(() => {
                        const images = getDisplayImages(lot);
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

                              {/* Image Counter */}
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

                              {/* Image Indicators */}
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
                    <Box sx={{ p: 2 }}>
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
                                ? "#15803d"
                                : lot.status === "reserved"
                                ? "#f59e0b"
                                : "#dc2626",
                            color: "white",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                          }}
                        >
                          {getStatusIcon(lot.status)}{" "}
                          {lot.status?.toUpperCase()}
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

                      <Divider sx={{ my: 1.5 }} />

                      {/* Pricing Information */}
                      <Box sx={{ mb: 1.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium" }}
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
                            ₱{Number(lot.downpayment_price).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Action Button */}
                      {lot.status === "available" && isLoggedIn && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 2,
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
            style={{ position: "absolute", top: 100, left: 150, zIndex: 1000 }}
          ></div>
        </div>
      </Box>
      <DialogComponent
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setDialogImageIndex(0); // Reset image index when closing
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

        {/* Enhanced Lot Image Slider Section */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Lot Images
          </Typography>

          <Box sx={{ position: "relative", width: "90%" }}>
            <Box
              component="img"
              src={(() => {
                if (selectedLot) {
                  const images = getDisplayImages(selectedLot);
                  return images[dialogImageIndex] || defaultImage;
                }
                return defaultImage;
              })()}
              alt="Lot Image"
              sx={{
                width: "100%",
                height: "200px",
                objectFit: "contain",
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
              }}
            />

            {/* Navigation arrows - only show if multiple images */}
            {selectedLot &&
              (() => {
                const images = getDisplayImages(selectedLot);
                if (images.length > 1) {
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

                      {/* Image counter */}
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
                        {dialogImageIndex + 1} / {images.length}
                      </Box>
                    </>
                  );
                }
                return null;
              })()}

            {/* Image dots indicators */}
            {selectedLot &&
              (() => {
                const images = getDisplayImages(selectedLot);
                if (images.length > 1) {
                  return (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      {images.map((_, index) => (
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
      </DialogComponent>
      {/* GCash Image Modal */}{" "}
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
