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
import { Add, Check } from "@mui/icons-material";
import FileUploadInput from "../../components/FileUploadInput";
import { toast } from "sonner";
import Echo from "laravel-echo";

const Cemeteries = () => {
  const isLoggedIn = !!localStorage.getItem("token");
  const mapRef = useRef(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

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
                </Popup>
              </Polygon>
            ))}
          </MapContainer>
          <div
            style={{ position: "absolute", top: 100, left: 150, zIndex: 1000 }}
          ></div>
        </div>
      </Box>

      {/* Reservation Dialog */}
      <DialogComponent
        open={openDialog}
        onClose={() => setOpenDialog(false)}
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
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Lot Image
          </Typography>

          <Box
            component="img"
            src={selectedLot?.lot_image ?? defaultImage}
            alt="GCASH Payment"
            sx={{
              width: "90%",
              height: "200px",
              objectFit: "contain",
            }}
          />
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
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            PMP GCASH
          </Typography>

          <Box
            component="img"
            src={GcashPayment}
            alt="GCASH Payment"
            sx={{
              width: "100%",
              height: "250px",
              objectFit: "contain",
              paddingBottom: "10px",
            }}
          />
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
    </>
  );
};

export default Cemeteries;
