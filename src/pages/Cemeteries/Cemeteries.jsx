import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  useMapEvents,
  FeatureGroup,
} from "react-leaflet";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  useUpdateLotMutation,
  useAddLotMutation,
  useGetLotQuery,
  useGetCemeteryQuery,
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
} from "@mui/material";
import { useForm } from "react-hook-form";
import { lotSchema } from "../../validations/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import * as turf from "@turf/turf";
import { EditControl } from "react-leaflet-draw";

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
  const [formType, setFormType] = useState("create"); // 'create' or 'edit'
  const [selectedLot, setSelectedLot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
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
    setError,
    formState: { errors },
  } = useForm({ resolver: yupResolver(lotSchema) });

  const { data: lotData, refetch: refetchLots } = useGetLotQuery({
    search: "",
  });

  const { data: cemeteryData } = useGetCemeteryQuery();
  const [addLot] = useAddLotMutation();
  const [updateLot] = useUpdateLotMutation();

  function cleanPointer(pointer) {
    return pointer?.replace(/^\//, ""); // Removes the leading '/'
  }

  const center = cemeteryData?.data?.[0]?.coordinates ?? [
    14.288794, 120.970325,
  ];

  const openForm = (type, data = null, coordinates = []) => {
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
      setValue("is_featured", data.is_featured || 0);
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
      reserved_until: formData.reserved_until || "",
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

  return (
    <>
      <div style={{ height: "80vh", width: "100%" }}>
        <MapContainer center={center} zoom={50} style={{ height: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* <DrawingTool
            onDrawComplete={onDrawComplete}
            isDrawing={isDrawing}
            existingLots={lotData?.data}
          /> */}
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
                const latlngs = layer.getLatLngs()[0]; // assuming a single polygon
                const coords = latlngs.map((latlng) => [
                  latlng.lat,
                  latlng.lng,
                ]);
                onDrawComplete(coords); // your existing function to open the form dialog
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
                  onClick={() => openForm("edit", lot, lot.coordinates)}
                  style={{ marginTop: 8, marginRight: 5 }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => openForm("edit", lot, lot.coordinates)}
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                {...register("status")}
                defaultValue="available"
                label="Status"
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="reserved">Reserved</MenuItem>
                <MenuItem value="sold">Sold</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Reserved Until"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...register("reserved_until")}
            />
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Is Featured</InputLabel>
              <Select
                {...register("is_featured")}
                defaultValue={0}
                label="Is Featured"
              >
                <MenuItem value={0}>No</MenuItem>
                <MenuItem value={1}>Yes</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
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
