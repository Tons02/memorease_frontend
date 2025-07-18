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
  Typography,
  Autocomplete,
  Box,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { lotSchema } from "../../validations/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import * as turf from "@turf/turf";
import defaultImage from "../../assets/default-image.png";
import { useGetCemeteryQuery } from "../../redux/slices/cemeterySlice";
import {
  useAddLotMutation,
  useArchivedLotMutation,
  useGetLotQuery,
  useUpdateLotMutation,
} from "../../redux/slices/apiLot";

const Cemeteries = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [coords, setCoords] = useState([]);
  const mapRef = useRef(null);
  const [formType, setFormType] = useState("create"); // 'create' or 'edit'
  const [selectedLot, setSelectedLot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
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
    pagination: "none",
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
                  color: lot.status === "available" ? "#15803d" : "red",
                  fillOpacity: 0.5,
                }}
              >
                <Popup>
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
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => openForm("edit", lot, lot.coordinates)}
                      style={{ marginTop: 8, marginRight: 5 }}
                    >
                      Reserve
                    </Button>
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
