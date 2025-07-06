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
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { cemeterySchema, lotSchema } from "../../validations/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import * as turf from "@turf/turf";
import { EditControl } from "react-leaflet-draw";
import { Add, Check, Dashboard, Map } from "@mui/icons-material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import FileUploadInput from "../../components/FileUploadInput";
import { toast } from "sonner";
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

const MapDeceased = () => {
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
    isValid,
    isDirty,
    formState: { errors },
  } = useForm({ resolver: yupResolver(lotSchema) });

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

  const { data: cemeteryData, isLoading: isGetLoadingCemetery } =
    useGetCemeteryQuery();

  const center = cemeteryData?.data?.[0]?.coordinates ?? [
    14.288794, 120.970325,
  ];

  const openForm = (type, data = null, coordinates = []) => {
    console.log(data?.is_featured);
    setFormType(type);
    setCoords(coordinates);

    if (type === "edit" && data) {
      setSelectedLot(data);
      setValue("lot_number", data.lot_number);
      setValue("price", data.price);
      setValue("status", data.status);
      setValue("reserved_until", data.reserved_until || "");
      setValue("promo_price", data.promo_price || "");
      setValue("promo_until", data.promo_until || "");
      setValue("is_featured", data.is_featured ? 1 : 0);
    } else {
      reset({
        lot_number: "",
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
          sx={{ color: "text.primary", display: "flex", alignItems: "center" }}
        >
          <Map sx={{ mr: 0.5 }} fontSize="inherit" />
          Deceased Map
        </Typography>
      </Breadcrumbs>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" sx={{ mr: 2 }}>
          Deceased Map
        </Typography>
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
                    polygon: false,
                  }}
                  edit={{
                    edit: false, // ❌ Disable edit tool
                    remove: false, // ❌ Disable delete tool
                  }}
                />
              </FeatureGroup>

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
                  <Popup>
                    <strong>{lot.lot_number}</strong>
                    <br />
                    Status: {lot.status}
                    <br />₱{lot.price}
                    <br />
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => openForm("edit", lot, lot.coordinates)}
                      style={{ marginTop: 8, marginRight: 5 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteClick(lot)}
                      style={{ marginTop: 8 }}
                    >
                      Delete
                    </Button>
                  </Popup>
                </Polygon>
              ))}
            </MapContainer>
          </div>
        )}
      </Box>
    </>
  );
};

export default MapDeceased;
