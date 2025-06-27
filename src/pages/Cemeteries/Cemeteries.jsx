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
  useUpdateLotMutation,
  useAddLotMutation,
  useGetLotQuery,
  useGetCemeteryQuery,
  useArchivedLotMutation,
} from "../../redux/slices/apiSlice";
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
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { lotSchema } from "../../validations/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import * as turf from "@turf/turf";
import { EditControl } from "react-leaflet-draw";
import { Dashboard, Map } from "@mui/icons-material";
import ListAltIcon from "@mui/icons-material/ListAlt";

const DrawingTool = ({ onDrawComplete, isDrawing, existingLots }) => {
  const [drawingCoords, setDrawingCoords] = useState([]);

  useMapEvents({
    click: (e) => {
      if (!isDrawing) return;

      const nextCoords = [...drawingCoords, [e.latlng.lat, e.latlng.lng]];

      if (nextCoords.length >= 3) {
        const drawnPolygon = turf.polygon([[...nextCoords, nextCoords[0]]]);

        const isOverlapping = existingLots.some((lot) => {
          const lotPoly = turf.polygon([
            [...lot.coordinates, lot.coordinates[0]],
          ]);
          return turf.booleanIntersects(drawnPolygon, lotPoly);
        });

        if (isOverlapping) {
          alert("❌ Cannot draw on top of an existing lot.");
          return;
        }
      }

      setDrawingCoords(nextCoords);
    },
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && drawingCoords.length >= 3 && isDrawing) {
        onDrawComplete(drawingCoords);
        setDrawingCoords([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawingCoords, isDrawing]);

  return drawingCoords.length > 0 ? (
    <Polygon
      positions={drawingCoords}
      pathOptions={{ color: "purple", dashArray: "4", fillOpacity: 0.2 }}
    />
  ) : null;
};

const Cemeteries = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [coords, setCoords] = useState([]);
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formType, setFormType] = useState("create"); // 'create' or 'edit'
  const [selectedLot, setSelectedLot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    control,
    formState: { errors },
  } = useForm({ resolver: yupResolver(lotSchema) });

  const isFeatured = watch("is_featured") === 1;

  const { data: lotData, refetch: refetchLots } = useGetLotQuery({
    search: "",
  });

  const { data: cemeteryData } = useGetCemeteryQuery();
  const [addLot] = useAddLotMutation();
  const [updateLot] = useUpdateLotMutation();
  const [deleteLot] = useArchivedLotMutation();

  function cleanPointer(pointer) {
    return pointer?.replace(/^\//, ""); // Removes the leading '/'
  }

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

  const onDrawComplete = (coords) => {
    openForm("create", null, coords);
  };

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      promo_price: formData.promo_price || "",
      promo_until: formData.promo_until || "",
      is_featured: parseInt(formData.is_featured),
      coordinates: coords,
    };

    try {
      if (formType === "edit") {
        await updateLot({ id: selectedLot.id, ...payload }).unwrap();
        setSnackbar({
          open: true,
          message: "Lot updated successfully",
          severity: "success",
        });
      } else {
        await addLot(payload).unwrap();
        setSnackbar({
          open: true,
          message: "Lot added successfully",
          severity: "success",
        });
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
      setSnackbar({
        open: true,
        message: error?.data?.errors?.[0]?.detail,
        severity: "error",
      });
    }
  };

  const handleDeleteLot = async () => {
    try {
      const response = await deleteLot({ id: selectedID }).unwrap();
      setOpenDeleteDialog(false);
      setSelectedID(null);
      refetchLots();
      setSnackbar({
        open: true,
        message: response?.message,
        severity: "success",
      });
    } catch (errors) {
      refetchLots();
      setSnackbar({
        open: true,
        message:
          errors?.data?.errors?.[0]?.detail || "An unexpected error occurred",
        severity: "error",
      });
    }
  };

  const handleDeleteClick = (lot) => {
    setSelectedID(lot.id);
    setOpenDeleteDialog(true);
  };

  const flyToLot = (lot) => {
    const map = mapRef.current;
    if (!map || !lot?.coordinates?.length) return;

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
          Map
        </Typography>
      </Breadcrumbs>
      <Typography variant="h4">Cemeteries</Typography>
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
                  setSnackbar({
                    open: true,
                    message:
                      "❌ You can only draw lots within the cemetery area.",
                    severity: "error",
                  });
                  return;
                }

                // Check if overlapping with any existing lot
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
                  setSnackbar({
                    open: true,
                    message: "❌ Cannot draw on top of an existing lot.",
                    severity: "error",
                  });
                  return;
                }

                // ✅ Lot is valid, proceed
                onDrawComplete(coords);
              }}
            />
          </FeatureGroup>

          {lotData?.data?.map((lot) => (
            <Polygon
              key={lot.id}
              positions={lot.coordinates}
              pathOptions={{
                color: lot.status === "available" ? "#15803d" : "red",
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
        <div
          style={{ position: "absolute", top: 100, left: 150, zIndex: 1000 }}
        >
          {/* <Button
            variant="contained"
            color={isDrawing ? "error" : "success"}
            onClick={() => setIsDrawing((prev) => !prev)}
          >
            {isDrawing ? "Cancel Drawing" : "Start Plotting"}
          </Button> */}
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {formType === "edit" ? "Edit Lot" : "Create Lot"}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <TextField
              label="Lot Number"
              fullWidth
              margin="normal"
              {...register("lot_number")}
              error={!!errors.lot_number}
              helperText={errors.lot_number?.message}
            />

            <TextField
              label="Price"
              type="number"
              fullWidth
              margin="normal"
              {...register("price")}
              error={!!errors.price}
              helperText={errors.price?.message}
            />

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

            {isFeatured && (
              <>
                <TextField
                  label="Promo Price"
                  type="number"
                  fullWidth
                  margin="normal"
                  {...register("promo_price")}
                />
                <TextField
                  label="Promo Until"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  {...register("promo_until")}
                />
              </>
            )}
            <Controller
              name="is_featured"
              control={control}
              defaultValue={0}
              render={({ field }) => (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Is Featured</InputLabel>
                  <Select
                    {...field}
                    label="Is Featured"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    <MenuItem value={0}>No</MenuItem>
                    <MenuItem value={1}>Yes</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </DialogContent>

          <DialogActions>
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenDialog(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="success">
              {formType === "edit" ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={openDeleteDialog}>
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
          <Button onClick={handleDeleteLot} variant="contained" color="success">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Cemeteries;
