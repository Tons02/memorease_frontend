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
      if (formType === "edit") {
        await updateLot({ id: selectedLot.id, ...payload }).unwrap();
        toast.success("Lot updated successfully");
      } else {
        await addLot(payload).unwrap();
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

      console.log("data", data);

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
          sx={{ color: "text.primary", display: "flex", alignItems: "center" }}
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
        <Typography variant="h4" sx={{ mr: 2 }}>
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
            <div
              style={{
                position: "absolute",
                top: 100,
                left: 150,
                zIndex: 1000,
              }}
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
      >
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
        <TextField
          label="Down Payment Price"
          type="number"
          fullWidth
          margin="normal"
          {...register("downpayment_price")}
          error={!!errors.downpayment_price}
          helperText={errors.downpayment_price?.message}
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
      </DialogComponent>

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
          <Button onClick={handleDeleteLot} color="success" variant="contained">
            {isDeleteLot ? <CircularProgress size={20} /> : "Yes"}
          </Button>
        </DialogActions>
      </Dialog>

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
