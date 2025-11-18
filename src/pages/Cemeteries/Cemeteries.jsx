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
  Paper,
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
  Straighten,
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
  const [formType, setFormType] = useState("create");
  const [selectedLot, setSelectedLot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCemeteryInformation, setOpenCemeteryInformation] = useState(false);
  const [selectedID, setSelectedID] = useState(null);

  // Lot size configuration
  const [drawMode, setDrawMode] = useState("preset"); // 'preset' or 'custom'
  const [selectedPresetSize, setSelectedPresetSize] = useState("small");
  const [customWidth, setCustomWidth] = useState(2);
  const [customLength, setCustomLength] = useState(2);

  // Predefined lot sizes (in meters) - common cemetery lot sizes
  const presetSizes = {
    small: { width: 2, length: 2, label: "Small (2m × 2m)" },
    medium: { width: 2.5, length: 2.5, label: "Medium (2.5m × 2.5m)" },
    standard: { width: 3, length: 3, label: "Standard (3m × 3m)" },
    large: { width: 4, length: 3, label: "Large (4m × 3m)" },
    family: { width: 5, length: 4, label: "Family (5m × 4m)" },
    premium: { width: 6, length: 5, label: "Premium (6m × 5m)" },
  };

  const cemeteryBoundaryLatLng = [
    [14.292776, 120.971491],
    [14.292642, 120.971628],
    [14.292266, 120.971781],
    [14.291931, 120.971727],
    [14.291476, 120.97162],
    [14.289574, 120.971824],
    [14.289574, 120.971824],
    [14.289985, 120.97176],
    [14.28921, 120.971609],
    [14.28822, 120.971692],
    [14.287349, 120.971935],
    [14.286792, 120.97218],
    [14.286591, 120.972018],
    [14.285762, 120.971949],
    [14.285103, 120.971974],
    [14.284999, 120.970676],
    [14.285106, 120.970709],
    [14.285213, 120.970629],
    [14.285322, 120.970549],
    [14.285478, 120.970437],
    [14.285733, 120.970257],
    [14.285954, 120.970118],
    [14.28615, 120.969991],
    [14.286371, 120.969865],
    [14.286618, 120.969726],
    [14.286874, 120.969569],
    [14.287126, 120.969427],
    [14.287303, 120.969337],
    [14.287572, 120.969182],
    [14.287919, 120.968985],
    [14.288256, 120.968777],
    [14.288551, 120.968603],
    [14.2888, 120.968462],
    [14.289119, 120.968457],
    [14.289213, 120.968452],
    [14.289388, 120.96836],
    [14.289633, 120.96824],
    [14.29003, 120.968594],
    [14.290471, 120.969072],
    [14.291004, 120.969645],
    [14.291559, 120.970267],
    [14.292298, 120.970934],
    [14.292776, 120.971427],
    [14.292776, 120.971491],
  ];

  const cemeteryPolygon = turf.polygon([
    cemeteryBoundaryLatLng.map(([lat, lng]) => [lng, lat]),
  ]);

  // Helper function to create rectangle coordinates from center point
  const createRectangleFromCenter = (
    centerLat,
    centerLng,
    widthMeters,
    lengthMeters
  ) => {
    const latOffset = lengthMeters / 2 / 111320;
    const lngOffset =
      widthMeters / 2 / (111320 * Math.cos((centerLat * Math.PI) / 180));

    return [
      [centerLat + latOffset, centerLng - lngOffset],
      [centerLat + latOffset, centerLng + lngOffset],
      [centerLat - latOffset, centerLng + lngOffset],
      [centerLat - latOffset, centerLng - lngOffset],
    ];
  };

  const handleMapClick = (e) => {
    if (drawMode === "freehand") return; // Skip for freehand drawing

    const { lat, lng } = e.latlng;

    // Get dimensions based on mode
    let width, length;
    if (drawMode === "preset") {
      const size = presetSizes[selectedPresetSize];
      width = size.width;
      length = size.length;
    } else if (drawMode === "custom") {
      width = parseFloat(customWidth);
      length = parseFloat(customLength);

      // Validate custom dimensions
      if (!width || !length || width <= 0 || length <= 0) {
        toast.error("Please enter valid width and length values.");
        return;
      }
    }

    const coords = createRectangleFromCenter(lat, lng, width, length);

    // Convert to [lng, lat] and close loop for turf
    const lotPolygon = turf.polygon([
      coords
        .map(([lat, lng]) => [lng, lat])
        .concat([[coords[0][1], coords[0][0]]]),
    ]);

    // Check if inside cemetery boundary
    const isInside = turf.booleanWithin(lotPolygon, cemeteryPolygon);
    if (!isInside) {
      toast.error("Cannot place lot outside cemetery boundary.");
      return;
    }

    // Check overlap with existing lots
    const isOverlapping = lotData?.data?.some((lot) => {
      if (!lot?.coordinates?.length) return false;
      const lotPoly = turf.polygon([
        lot.coordinates
          .map(([lat, lng]) => [lng, lat])
          .concat([[lot.coordinates[0][1], lot.coordinates[0][0]]]),
      ]);
      return turf.booleanIntersects(lotPolygon, lotPoly);
    });

    if (isOverlapping) {
      toast.error("Cannot overlap with existing lot.");
      return;
    }

    onDrawComplete(coords);
  };

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

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
      is_land_mark: 0,
    },
    resolver: yupResolver(lotSchema),
  });

  const isLandMark = watch("is_land_mark", "0");

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
      case "land_mark":
        return "info";
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
      case "land_mark":
        return "🔵";
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
    return pointer?.replace(/^\//, "");
  }

  const center = [14.288794, 120.970325];

  const openForm = (type, data = null, coordinates = []) => {
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
      setValue("is_land_mark", data.is_land_mark);
      setValue("downpayment_price", data.downpayment_price);
      setValue("reserved_until", data.reserved_until || "");
      setValue("promo_price", data.promo_price || "");
      setValue("promo_until", data.promo_until || "");
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
        is_land_mark: 0,
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
      promo_price: formData.promo_price || null,
      promo_until: formData.promo_until || null,
      is_land_mark: parseInt(formData.is_land_mark),
      coordinates: coords,
    };

    try {
      const formData = new FormData();

      if (formType === "edit") {
        formData.append("_method", "PATCH");
      }

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
      formData.append("is_land_mark", payload.is_land_mark);

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

    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    if (map.tap) map.tap.disable();

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

      if (!cemeteryId) return;

      const formData = new FormData();
      formData.append("_method", "PATCH");
      formData.append("name", data?.name || "");
      formData.append("description", data?.description || "");
      formData.append("location", data?.location || "");

      if (data.profile_picture) {
        formData.append("profile_picture", data.profile_picture);
      }

      await updateCemetery({ id: cemeteryId, formData }).unwrap();
      toast.success("Cemetery info updated successfully");
      setOpenCemeteryInformation(false);
    } catch (err) {
      toast.error("Failed to update cemetery info");
    }
  };

  useEffect(() => {
    if (isLandMark == "1") {
      setValue("price", 0);
      setValue("downpayment_price", 0);
      setValue("status", "land_mark");
    } else if (isLandMark == "0") {
      setValue("status", "available");
    }
  }, [isLandMark, setValue]);

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
          disabled={isGetLoadingCemetery}
        >
          {isGetLoadingCemetery ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Edit Information"
          )}
        </Button>
      </Box>

      {/* Lot Size Configuration Panel */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Straighten color="secondary" />
            <Typography variant="h6" fontWeight={600}>
              Lot Size Configuration
            </Typography>
          </Box>

          {/* Draw Mode Selection */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Drawing Mode</InputLabel>
            <Select
              value={drawMode}
              onChange={(e) => setDrawMode(e.target.value)}
              label="Drawing Mode"
            >
              <MenuItem value="preset">📐 Preset Sizes</MenuItem>
              <MenuItem value="custom">✏️ Custom Size</MenuItem>
              <MenuItem value="freehand">🖊️ Freehand Draw</MenuItem>
            </Select>
          </FormControl>

          {/* Preset Size Selection */}
          {drawMode === "preset" && (
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Select Preset Size</InputLabel>
                <Select
                  value={selectedPresetSize}
                  onChange={(e) => setSelectedPresetSize(e.target.value)}
                  label="Select Preset Size"
                >
                  {Object.entries(presetSizes).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                💡 Click anywhere on the map to place a lot with the selected
                size
              </Typography>
            </Box>
          )}

          {/* Custom Size Input */}
          {drawMode === "custom" && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Width (meters)"
                    type="number"
                    size="small"
                    fullWidth
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    InputProps={{
                      inputProps: { min: 0.5, step: 0.5 },
                      endAdornment: (
                        <InputAdornment position="end">m</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Length (meters)"
                    type="number"
                    size="small"
                    fullWidth
                    value={customLength}
                    onChange={(e) => setCustomLength(e.target.value)}
                    InputProps={{
                      inputProps: { min: 0.5, step: 0.5 },
                      endAdornment: (
                        <InputAdornment position="end">m</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                💡 Enter custom dimensions, then click on the map to place the
                lot
              </Typography>
            </Box>
          )}

          {/* Freehand Instructions */}
          {drawMode === "freehand" && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                💡 Use the drawing tools on the right side of the map to draw
                irregular shapes or polygons
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Box position="relative">
        {isLotLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center">
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
                  backgroundColor: "#ffff",
                  width: 200,
                }}
              />
              <MapRefHandler
                setMap={(mapInstance) => (mapRef.current = mapInstance)}
              />
              <MapClickHandler />
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              <FeatureGroup>
                <EditControl
                  position="topright"
                  draw={{
                    rectangle: drawMode === "freehand",
                    circle: false,
                    circlemarker: false,
                    marker: false,
                    polyline: false,
                    polygon: drawMode === "freehand",
                  }}
                  onCreated={(e) => {
                    const layer = e.layer;
                    const latlngs = layer.getLatLngs()[0];
                    const coords = latlngs.map((latlng) => [
                      latlng.lat,
                      latlng.lng,
                    ]);

                    const lotPolygon = turf.polygon([
                      coords
                        .map(([lat, lng]) => [lng, lat])
                        .concat([[coords[0][1], coords[0][0]]]),
                    ]);

                    const isInside = turf.booleanWithin(
                      lotPolygon,
                      cemeteryPolygon
                    );

                    if (!isInside) {
                      toast.error(
                        "You can only draw within the cemetery boundary."
                      );
                      return;
                    }

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
                          ? "#ffcc00"
                          : lot.status === "sold"
                          ? "red"
                          : lot.status === "land_mark"
                          ? "#1e40af"
                          : "gray",
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
                          {(() => {
                            const currentMedia = displayImages[currentIndex];
                            const isVideo =
                              currentMedia &&
                              (currentMedia.endsWith(".mp4") ||
                                currentMedia.endsWith(".mov") ||
                                currentMedia.endsWith(".avi") ||
                                currentMedia.endsWith(".mkv") ||
                                currentMedia.includes("video"));

                            if (isVideo) {
                              return (
                                <CardMedia
                                  component="video"
                                  height="180"
                                  controls
                                  src={currentMedia}
                                  sx={{
                                    objectFit: "contain",
                                    backgroundColor: "#000",
                                    height: { xs: "150px", sm: "180px" },
                                  }}
                                />
                              );
                            } else {
                              return (
                                <CardMedia
                                  component="img"
                                  height="180"
                                  image={currentMedia || defaultImage}
                                  alt={`Lot ${lot.lot_number} - Image ${
                                    currentIndex + 1
                                  }`}
                                  sx={{
                                    objectFit: "contain",
                                    backgroundColor: "#f5f5f5",
                                    height: { xs: "150px", sm: "180px" },
                                  }}
                                />
                              );
                            }
                          })()}

                          {/* Navigation arrows */}
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

                              {/* Image indicators and counter */}
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
                              label={`${getStatusIcon(lot.status)} ${
                                lot.status === "land_mark"
                                  ? "LANDMARK"
                                  : lot.status?.toUpperCase()
                              }`}
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

                          {lot.is_land_mark == "0" && (
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
                                  sx={{
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  }}
                                >
                                  Down Payment:
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight="medium"
                                  sx={{
                                    fontSize: { xs: "0.875rem", sm: "1rem" },
                                  }}
                                >
                                  ₱
                                  {Number(
                                    lot.downpayment_price
                                  ).toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                          )}

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
        maxWidth="md"
      >
        {/* Image Upload Section */}
        <Typography variant="h6" gutterBottom>
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
                  title="Second Image/Video"
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
                  title="Third Image/Video"
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
                  title="Fourth Image/Video"
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
        <Typography variant="h6" gutterBottom>
          📋 Basic Information
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Controller
              name="is_land_mark"
              control={control}
              defaultValue="0"
              render={({ field }) => (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Landmark</InputLabel>
                  <Select
                    {...field}
                    label="Landmark"
                    sx={{
                      width: 100,
                    }}
                  >
                    <MenuItem value="0">No</MenuItem>
                    <MenuItem value="1">Yes</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label={isLandMark == "0" ? "Lot Number" : "Landmark Name"}
              fullWidth
              margin="normal"
              {...register("lot_number")}
              error={!!errors.lot_number}
              helperText={errors.lot_number?.message}
            />
          </Grid>
          {isLandMark == "0" && (
            <Grid item xs={12} sm={4}>
              <Controller
                name="status"
                control={control}
                defaultValue={isLandMark == "0" ? "available" : "land_mark"}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      {...field}
                      label="Status"
                      sx={{
                        width: 150,
                      }}
                    >
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="reserved">Reserved</MenuItem>
                      <MenuItem value="sold">Sold</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          )}

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

        {/* Only show pricing if not a landmark */}
        {isLandMark == "0" && (
          <>
            <Divider sx={{ my: 3 }} />

            {/* Pricing Section */}
            <Typography variant="h6" gutterBottom>
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
        <Typography>Are you sure you want to delete this record?</Typography>
      </DialogComponent>

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
