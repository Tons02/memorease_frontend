import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  useMapEvents,
  FeatureGroup,
  useMap,
} from "react-leaflet";
import "leaflet-draw/dist/leaflet.draw.css";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Divider,
  Typography,
  Breadcrumbs,
  Link,
  Autocomplete,
  Box,
  CircularProgress,
  Input,
  FormHelperText,
  Grid,
  InputAdornment,
  Card,
  CardMedia,
  CardContent,
  Chip,
  IconButton,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { cemeterySchema, lotSchema } from "../../validations/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import * as turf from "@turf/turf";
import { EditControl } from "react-leaflet-draw";
import {
  Add,
  AttachMoney,
  Check,
  ChevronLeft,
  ChevronRight,
  Dashboard,
  Delete,
  Edit,
  Home,
  Info,
  Map,
  Remove,
} from "@mui/icons-material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import FileUploadInput from "../../components/FileUploadInput";
import { toast } from "sonner";
import defaultImage from "../../assets/default-image.png";
import {
  useGetCemeteryQuery,
  useUpdateCemeteryMutation,
} from "../../redux/slices/cemeterySlice";
import {
  useAddLotMutation,
  useArchivedLotMutation,
  useGetLotQuery,
  useUpdateLotMutation,
} from "../../redux/slices/apiLot";
import DialogComponent from "../../components/DialogComponent";
import MapLegend from "../../components/MapLegend";

const Cemeteries = () => {
  const [coords, setCoords] = useState([]);
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formType, setFormType] = useState("create"); // 'create' or 'edit'
  const [selectedLot, setSelectedLot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCemeteryInformation, setOpenCemeteryInformation] = useState(false);
  const [selectedID, setSelectedID] = useState(null);
  const cemeteryBoundaryLatLng = [
    [14.292776, 120.971491],
    [14.292266, 120.971781],
    [14.291476, 120.97162],
    [14.289574, 120.971824],
    [14.28921, 120.971609],
    [14.285103, 120.971974],
    [14.284999, 120.970676],
    [14.289584, 120.968186],
    [14.292776, 120.971427],
    [14.292776, 120.971491],
  ];

  const cemeteryPolygon = turf.polygon([
    cemeteryBoundaryLatLng.map(([lat, lng]) => [lng, lat]),
  ]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      lot_number: "",
      description: "",
      lot_image: null,
      second_lot_image: null,
      third_lot_image: null,
      fourth_lot_image: null,
      status: "",
      reserved_until: "",
      price: "",
      downpayment_price: "",
      promo_price: "",
      promo_until: "",
      is_featured: "",
    },
    resolver: yupResolver(lotSchema),
  });

  const isFeatured = watch("is_featured") === 1;

  const {
    data: lotData,
    refetch: refetchLots,
    isLoading: isLotLoading,
  } = useGetLotQuery({
    search: "",
    pagination: "none",
    status: "active",
  });

  const {
    register: cemeteryRegister,
    handleSubmit: handleCemeterySubmit,
    reset: resetCemeteryForm,
    setValue: cemeterySetValue,
    formState: { errors: cemeteryErrors },
  } = useForm({ resolver: yupResolver(cemeterySchema) });

  const { data: cemeteryData, isLoading: isGetLoadingCemetery } =
    useGetCemeteryQuery();
  const [updateCemetery, { isLoading: isUpdateCemetery }] =
    useUpdateCemeteryMutation();
  const [addLot, { isLoading: isAddLot }] = useAddLotMutation();
  const [updateLot, { isLoading: isUpdateLot }] = useUpdateLotMutation();
  const [deleteLot, { isLoading: isDeleteLot }] = useArchivedLotMutation();
  const [currentImageIndex, setCurrentImageIndex] = useState({});

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
    if (cemeteryData?.data?.[0]) {
      resetCemeteryForm({
        profile_picture: cemeteryData.data[0].profile_picture || "",
        name: cemeteryData.data[0].name || "",
        description: cemeteryData.data[0].description || "",
        location: cemeteryData.data[0].location || "",
      });
    }
  }, [cemeteryData, resetCemeteryForm]);

  function cleanPointer(pointer) {
    return pointer?.replace(/^\//, ""); // Removes the leading '/'
  }

  // const center = cemeteryData?.data?.[0]?.coordinates ?? [
  //   14.288794, 120.970325,
  // ];
  const center = [14.288794, 120.970325];

  const openForm = (type, data = null, coordinates = []) => {
    console.log(data?.is_featured);
    setFormType(type);
    setCoords(coordinates);

    if (type === "edit" && data) {
      setSelectedLot(data);
      setValue("lot_image", data.lot_image);
      setValue("second_lot_image", data.second_lot_image);
      setValue("third_lot_image", data.third_lot_image);
      setValue("fourth_lot_image", data.fourth_lot_image);
      setValue("lot_number", data.lot_number);
      setValue("description", data.description);
      setValue("price", data.price);
      setValue("status", data.status);
      setValue("downpayment_price", data.downpayment_price);
      setValue("reserved_until", data.reserved_until || "");
      setValue("promo_price", data.promo_price || "");
      setValue("promo_until", data.promo_until || "");
      setValue("is_featured", data.is_featured ? 1 : 0);
      setSelectedID(data.id);
    } else {
      reset({
        lot_number: "",
        description: "",
        lot_image: null,
        second_lot_image: null,
        third_lot_image: null,
        fourth_lot_image: null,
        price: "",
        status: "available",
        reserved_until: "",
        promo_price: "",
        promo_until: "",
        is_featured: 0,
      });
    }

    setOpenDialog(true);
  };

  const onDrawComplete = (coords) => {
    openForm("create", null, coords);
  };

  const handleSubmitUpdateCreate = async (formData) => {
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      promo_price: formData.promo_price || "",
      promo_until: formData.promo_until || "",
      is_featured: parseInt(formData.is_featured),
      coordinates: coords,
    };

    try {
      const formData = new FormData();

      if (formType === "edit") {
        console.log("selected id", selectedID);
        formData.append("_method", "PATCH");
      }

      // Common fields for both add and edit
      formData.append("lot_number", payload.lot_number);
      formData.append("description", payload.description);
      formData.append("coordinates", JSON.stringify(payload.coordinates || []));
      formData.append("status", payload.status);
      formData.append("reserved_until", payload.reserved_until);
      formData.append("price", payload.price);
      formData.append("downpayment_price", payload.downpayment_price);
      formData.append("promo_price", payload.promo_price);
      formData.append("promo_until", payload.promo_until);
      formData.append("is_featured", payload.is_featured);

      if (payload.lot_image instanceof File) {
        formData.append("lot_image", payload.lot_image);
      }

      if (payload.second_lot_image instanceof File) {
        formData.append("second_lot_image", payload.second_lot_image);
      }

      if (payload.third_lot_image instanceof File) {
        formData.append("third_lot_image", payload.third_lot_image);
      }

      if (payload.fourth_lot_image instanceof File) {
        formData.append("fourth_lot_image", payload.fourth_lot_image);
      }
      if (formType === "edit") {
        await updateLot({ id: selectedID, lot: formData }).unwrap();
        toast.success("Lot updated successfully");
      } else {
        await addLot(formData).unwrap();
        toast.success("Lot added successfully");
      }

      refetchLots();
      setOpenDialog(false);
    } catch (error) {
      error?.data?.errors.map((inputError, index) =>
        setError(cleanPointer(inputError?.source?.pointer), {
          type: "message",
          message: inputError?.detail,
        })
      );
      toast.error(error?.data?.errors?.[0]?.detail);
    }
  };

  const handleDeleteLot = async () => {
    try {
      const response = await deleteLot({ id: selectedID }).unwrap();
      setOpenDeleteDialog(false);
      setSelectedID(null);
      refetchLots();
      toast.success(response?.message);
    } catch (errors) {
      refetchLots();
      toast.error(error?.data?.errors?.[0]?.detail);
    }
  };

  const handleDeleteClick = (lot) => {
    setSelectedID(lot.id);
    setOpenDeleteDialog(true);
  };

  const flyToLot = (lot) => {
    const map = mapRef.current;
    if (!map || !lot?.coordinates?.length) return;

    // Disable map interactions
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    if (map.tap) map.tap.disable(); // only if tap is available (for touch devices)

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

    // Re-enable map interactions after 3 seconds
    setTimeout(() => {
      map.removeLayer(marker);

      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      if (map.tap) map.tap.enable();
    }, 3000);
  };

  const MapRefHandler = ({ setMap }) => {
    const map = useMap();

    useEffect(() => {
      setMap(map);
    }, [map]);

    return null;
  };

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

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 1 }}>
        <Link
          underline="hover"
          sx={{ display: "flex", alignItems: "center" }}
          color="inherit"
          href="/"
        >
          <Dashboard sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Link
          underline="hover"
          sx={{
            display: "flex",
            alignItems: "center",
          }}
          color="inherit"
          href="/Admin/masterlist"
        >
          <ListAltIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Masterlist
        </Link>
        <Typography
          sx={{
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Map sx={{ mr: 0.5 }} fontSize="inherit" />
          Map
        </Typography>
      </Breadcrumbs>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" sx={{ mr: 2, fontWeight: 600 }}>
          Cemetery Map
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
            "Edit Information"
          )}
        </Button>
      </Box>

      <Box height="100%" position="relative">
        {isLotLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress color="success" />
          </Box>
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
                      backgroundColor: "transparent", // input field background
                    }}
                  />
                )}
                sx={{
                  position: "absolute",
                  top: 10,
                  left: 50,
                  zIndex: 1000,
                  backgroundColor: "#ffff", // for Autocomplete container
                  width: 150,
                }}
              />
              <MapRefHandler
                setMap={(mapInstance) => (mapRef.current = mapInstance)}
              />
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              <FeatureGroup>
                <EditControl
                  position="topright"
                  draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                    polyline: false,
                    polygon: true,
                  }}
                  onCreated={(e) => {
                    const layer = e.layer;
                    const latlngs = layer.getLatLngs()[0]; // Only first ring for simple polygon
                    const coords = latlngs.map((latlng) => [
                      latlng.lat,
                      latlng.lng,
                    ]);

                    // Convert to [lng, lat] and close loop
                    const lotPolygon = turf.polygon([
                      coords
                        .map(([lat, lng]) => [lng, lat])
                        .concat([[coords[0][1], coords[0][0]]]),
                    ]);

                    // Cemetery polygon defined globally or above
                    const isInside = turf.booleanWithin(
                      lotPolygon,
                      cemeteryPolygon
                    );

                    if (!isInside) {
                      toast.error(
                        "You can only draw within the cemetery and not over existing lots."
                      );
                      return;
                    }

                    // Check if overlapping with any existing lot
                    const isOverlapping = lotData?.data?.some((lot) => {
                      if (!lot?.coordinates?.length) return false;

                      const lotPoly = turf.polygon([
                        lot.coordinates
                          .map(([lat, lng]) => [lng, lat])
                          .concat([
                            [lot.coordinates[0][1], lot.coordinates[0][0]],
                          ]),
                      ]);
                      return turf.booleanIntersects(lotPolygon, lotPoly);
                    });

                    if (isOverlapping) {
                      toast.error("Cannot draw on top of an existing lot.");
                      return;
                    }

                    onDrawComplete(coords);
                  }}
                />
              </FeatureGroup>
              {lotData?.data?.map((lot) => {
                const displayImages = getDisplayImages(lot);
                const currentIndex = currentImageIndex[lot.id] || 0;

                return (
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
                    <Popup maxWidth={350} className="custom-popup">
                      <Card
                        sx={{
                          width: "100%",
                          maxWidth: { xs: "280px", sm: "320px", md: "350px" },
                          minWidth: { xs: "250px", sm: "300px" },
                        }}
                      >
                        {/* Image Slider Section */}
                        <Box sx={{ position: "relative" }}>
                          <CardMedia
                            component="img"
                            height="180"
                            image={displayImages[currentIndex] || defaultImage}
                            alt={`Lot ${lot.lot_number} - Image ${
                              currentIndex + 1
                            }`}
                            sx={{
                              objectFit: "contain",
                              backgroundColor: "#f5f5f5",
                              height: { xs: "150px", sm: "180px" },
                            }}
                          />

                          {/* Image Navigation - Only show if more than 1 image */}
                          {displayImages.length > 1 && (
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
                                {displayImages.map((_, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      backgroundColor:
                                        index === currentIndex
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
                                {currentIndex + 1} / {displayImages.length}
                              </Box>
                            </>
                          )}
                        </Box>

                        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
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
                              component="div"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                fontSize: { xs: "1rem", sm: "1.25rem" },
                              }}
                            >
                              <Home fontSize="small" color="secondary" />
                              {lot.lot_number}
                            </Typography>
                            <Chip
                              label={`${getStatusIcon(
                                lot.status
                              )} ${lot.status?.toUpperCase()}`}
                              color={getStatusColor(lot.status)}
                              size="small"
                              variant="filled"
                              sx={{
                                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                              }}
                            />
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
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                              >
                                <Info
                                  fontSize="small"
                                  sx={{ mt: 0.1, flexShrink: 0 }}
                                />
                                <span>{lot.description}</span>
                              </Typography>
                            </Box>
                          )}

                          <Divider sx={{ my: 1 }} />

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
                                color="text.secondary"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                              >
                                Total Price:
                              </Typography>
                              <Typography
                                variant="h6"
                                color="secondary.main"
                                fontWeight="bold"
                                sx={{
                                  fontSize: { xs: "1rem", sm: "1.25rem" },
                                }}
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
                                color="text.secondary"
                                sx={{
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                              >
                                Down Payment:
                              </Typography>
                              <Typography
                                variant="body1"
                                color="success.main"
                                fontWeight="medium"
                                sx={{
                                  fontSize: { xs: "0.875rem", sm: "1rem" },
                                }}
                              >
                                ₱
                                {Number(lot.downpayment_price).toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Action Buttons */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              mt: 1.5,
                              flexDirection: { xs: "column", sm: "row" },
                            }}
                          >
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<Edit />}
                              onClick={() =>
                                openForm("edit", lot, lot.coordinates)
                              }
                              sx={{
                                flex: 1,
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                py: { xs: 0.75, sm: 1 },
                              }}
                            >
                              Edit
                            </Button>

                            {lot.status !== "reserved" &&
                              lot.status !== "sold" && (
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  startIcon={<Delete />}
                                  onClick={() => handleDeleteClick(lot)}
                                  sx={{
                                    flex: 1,
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    py: { xs: 0.75, sm: 1 },
                                  }}
                                >
                                  Delete
                                </Button>
                              )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Popup>
                  </Polygon>
                );
              })}
              <MapLegend />
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

      {/* Form Dialog */}
      <DialogComponent
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmitUpdateCreate}
        title={formType === "edit" ? "Edit Lot" : "Create Lot"}
        icon={<Add color="secondary" />}
        isLoading={formType === "edit" ? isAddLot : isUpdateLot}
        submitIcon={<Check />}
        submitLabel={formType === "edit" ? "Update" : "Confirm"}
        formMethods={{ handleSubmit, reset }}
        isValid={true}
        isDirty={true}
        maxWidth="md" // Increased from default to accommodate better layout
      >
        {/* Image Upload Section */}
        <Typography
          variant="h6"
          gutterBottom
          sx={{ mt: 1, mb: 2, color: "secondary.main" }}
        >
          📷 Lot Images
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Controller
              name="lot_image"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <FileUploadInput
                  title="Primary Image"
                  name="lot_image"
                  value={field.value}
                  onChange={field.onChange}
                  setValue={setValue}
                  previousImageUrl={defaultImage}
                  error={!!errors.lot_image}
                  helperText={errors.lot_image?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Controller
              name="second_lot_image"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <FileUploadInput
                  title="Second Image"
                  name="second_lot_image"
                  value={field.value}
                  onChange={field.onChange}
                  setValue={setValue}
                  previousImageUrl={defaultImage}
                  error={!!errors.second_lot_image}
                  helperText={errors.second_lot_image?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Controller
              name="third_lot_image"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <FileUploadInput
                  title="Third Image"
                  name="third_lot_image"
                  value={field.value}
                  onChange={field.onChange}
                  setValue={setValue}
                  previousImageUrl={defaultImage}
                  error={!!errors.third_lot_image}
                  helperText={errors.third_lot_image?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Controller
              name="fourth_lot_image"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <FileUploadInput
                  title="Fourth Image"
                  name="fourth_lot_image"
                  value={field.value}
                  onChange={field.onChange}
                  setValue={setValue}
                  previousImageUrl={defaultImage}
                  error={!!errors.fourth_lot_image}
                  helperText={errors.fourth_lot_image?.message}
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Basic Information Section */}
        <Typography
          variant="h6"
          gutterBottom
          sx={{ mb: 2, color: "secondary.main" }}
        >
          📋 Basic Information
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Lot Number"
              fullWidth
              margin="normal"
              {...register("lot_number")}
              error={!!errors.lot_number}
              helperText={errors.lot_number?.message}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name="status"
              control={control}
              defaultValue="available"
              render={({ field }) => (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="reserved">Reserved</MenuItem>
                    <MenuItem value="sold">Sold</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={1}
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Pricing Section */}
        <Typography
          variant="h6"
          gutterBottom
          sx={{ mb: 2, color: "secondary.main" }}
        >
          💰 Pricing Details
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Price"
              type="number"
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₱</InputAdornment>
                ),
              }}
              {...register("price")}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Down Payment Price"
              type="number"
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₱</InputAdornment>
                ),
              }}
              {...register("downpayment_price")}
              error={!!errors.downpayment_price}
              helperText={errors.downpayment_price?.message}
            />
          </Grid>
        </Grid>

        {/* Promotional Section - Only show if featured */}
        {isFeatured && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mb: 2, color: "secondary.main" }}
            >
              🏷️ Promotional Pricing
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Promo Price"
                  type="number"
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₱</InputAdornment>
                    ),
                  }}
                  {...register("promo_price")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Promo Until"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  {...register("promo_until")}
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogComponent>

      {/* Confirmation Dialog for Delete */}
      <DialogComponent
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onSubmit={handleDeleteLot}
        title={"Delete Lot"}
        icon={<Remove color="error" />}
        isLoading={isDeleteLot}
        submitIcon={<Check />}
        submitLabel={"Confirm"}
        formMethods={{ handleSubmit }}
        isArchived={true}
      >
        <Typography>Are you sure you want to detele this record?</Typography>
      </DialogComponent>
      {/* <Dialog open={openDeleteDialog}>
        <DialogTitle>Delete</DialogTitle>
        <Divider />
        <DialogContent>
          <Typography>Are you sure you want to detele this record?</Typography>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            variant="contained"
            color="error"
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteLot} color="success" variant="contained">
            {isDeleteLot ? <CircularProgress size={20} /> : "Yes"}
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* Edit Information Dialog*/}
      <DialogComponent
        open={openCemeteryInformation}
        onClose={() => setOpenCemeteryInformation(false)}
        onSubmit={onSubmitCemeteryUpdate}
        title={"Cemetery Information"}
        icon={<Add color="secondary" />}
        isLoading={isUpdateCemetery}
        submitIcon={<Check />}
        submitLabel={"Update"}
        formMethods={{ handleSubmit: handleCemeterySubmit, reset }}
        isValid={true}
        isDirty={true}
        reset
      >
        <Controller
          name="profile_picture" // ✅ Match backend expected key
          control={control}
          defaultValue={null}
          render={({ field }) => (
            <FileUploadInput
              title="Cemetery"
              name={field.name}
              value={field.value}
              setValue={cemeterySetValue}
              onChange={field.onChange}
              previousImageUrl={cemeteryData?.data?.[0]?.profile_picture}
              error={!!errors.profile_picture}
              helperText={errors.profile_picture?.message}
            />
          )}
        />

        <FormHelperText error>
          {cemeteryErrors.profile_picture?.message}
        </FormHelperText>
        <TextField
          label="Name"
          type="text"
          fullWidth
          margin="normal"
          {...cemeteryRegister("name")}
          error={!!cemeteryErrors.name}
          helperText={cemeteryErrors.name?.message}
        />
        <TextField
          label="Description"
          type="text"
          fullWidth
          margin="normal"
          {...cemeteryRegister("description")}
          error={!!cemeteryErrors.description}
          helperText={cemeteryErrors.description?.message}
        />
        <TextField
          label="Location"
          type="text"
          fullWidth
          margin="normal"
          {...cemeteryRegister("location")}
          error={!!cemeteryErrors.location}
          helperText={cemeteryErrors.location?.message}
        />
      </DialogComponent>
    </>
  );
};

export default Cemeteries;
