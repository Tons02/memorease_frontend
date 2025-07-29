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
import PlaceIcon from "@mui/icons-material/Place";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import defaultImage from "../../assets/default-image.png";
import {
  Button,
  TextField,
  Typography,
  Breadcrumbs,
  Link,
  Autocomplete,
  Box,
  CircularProgress,
} from "@mui/material";
import * as turf from "@turf/turf";
import { EditControl } from "react-leaflet-draw";
import { Add, Check, Dashboard, Map } from "@mui/icons-material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import "leaflet-routing-machine";
import L from "leaflet";
import { useGetCemeteryQuery } from "../../redux/slices/cemeterySlice";
import { useGetDeceasedQuery } from "../../redux/slices/deceasedSlice";

const CustomerMapViewing = () => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedFullName, setSelectedFullName] = useState(null);
  const [userIconState, setIconState] = useState(null);
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIconState(true);
        },
        (error) => {
          setIconState(false);
          console.warn("Geolocation failed, using default location.", error);
          setUserLocation({
            lat: 14.293145,
            lng: 120.971924,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
        }
      );
    } else {
      setUserLocation({
        lat: 14.293145,
        lng: 120.971924,
      });
    }
  }, []);

  const {
    data: deceasedData,
    refetch: refetchDeceased,
    isLoading: isDeceasedLoading,
  } = useGetDeceasedQuery({ search: "", pagination: "none", status: "active" });

  const { data: cemeteryData, isLoading: isGetLoadingCemetery } =
    useGetCemeteryQuery();

  const center = cemeteryData?.data?.[0]?.coordinates ?? [
    14.288794, 120.970325,
  ];

  let routingControl = null; // global variable to store the routing instance

  const flyToLot = (lot) => {
    const map = mapRef.current;
    if (!map || !lot?.lot?.coordinates?.length || !userLocation) return;

    const reversedCoords = lot.lot.coordinates.map(([lat, lng]) => [lng, lat]);
    const lotPolygon = turf.polygon([[...reversedCoords, reversedCoords[0]]]);
    const lotCenter = turf.center(lotPolygon).geometry.coordinates;
    const lotLatLng = L.latLng(lotCenter[1], lotCenter[0]);
    const userLatLng = L.latLng(userLocation.lat, userLocation.lng);

    // Remove previous route if it exists
    if (routingControl) {
      map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
      waypoints: [userLatLng, lotLatLng],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
    }).addTo(map);
  };

  const MapRefHandler = ({ setMap }) => {
    const map = useMap();

    useEffect(() => {
      setMap(map);
    }, [map]);

    return null;
  };

  const lotGroups = deceasedData?.data?.reduce((acc, person) => {
    const lot = person.lot;
    if (!lot || !lot.id) return acc;

    const lotId = lot.id;

    if (!acc[lotId]) {
      acc[lotId] = {
        lot,
        deceased: [],
      };
    }

    acc[lotId].deceased.push(person);
    return acc;
  }, {});

  console.log(deceasedData?.data);
  return (
    <>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h4" sx={{ mr: 2 }}>
            Deceased Map
          </Typography>
          <PlaceIcon color={userIconState ? "secondary" : "error"} />
        </Box>

        <Box height="100%" position="relative">
          {isDeceasedLoading ? (
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
                zoom={50}
                style={{ height: "100%" }}
              >
                <Autocomplete
                  options={deceasedData?.data || []}
                  getOptionLabel={(option) => option.full_name || ""}
                  onChange={(event, selectedLot) => {
                    console.log("Selected Lot:", selectedLot);
                    if (selectedLot) {
                      flyToLot(selectedLot);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Deceased"
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
                    width: 200,
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
                      edit: false,
                      remove: false,
                    }}
                  />
                </FeatureGroup>

                {lotGroups &&
                  Object.entries(lotGroups).map(
                    ([lotId, { lot, deceased }]) => (
                      <Polygon
                        key={lotId}
                        positions={lot.coordinates}
                        pathOptions={{
                          color: "#15803d",
                          fillOpacity: 0.5,
                        }}
                      >
                        <Popup minWidth={250} maxWidth={150}>
                          <Swiper
                            spaceBetween={10}
                            slidesPerView={1}
                            navigation
                            modules={[Navigation]}
                          >
                            {/* Slides for each deceased */}
                            {deceased.map((person) => (
                              <SwiperSlide key={person.id}>
                                <div>
                                  <strong>Name: </strong>
                                  {person.full_name}
                                  <br />
                                  <strong>Birthday:</strong> {person.birthday}
                                  <br />
                                  <strong>Death Date: </strong>
                                  {person.death_date}
                                  <br />
                                  {person.lot_image && (
                                    <img
                                      src={person.lot_image}
                                      alt="Certificate"
                                      style={{
                                        display: "block", // makes margin auto work
                                        margin: "6px auto 0", // top margin 6px, auto left/right
                                        width: "100%", // responsive width
                                        maxWidth: "150px", // limit size
                                        objectFit: "contain",
                                        borderRadius: "6px",
                                      }}
                                    />
                                  )}
                                </div>
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </Popup>
                      </Polygon>
                    )
                  )}
              </MapContainer>
            </div>
          )}
        </Box>
      </Box>
    </>
  );
};

export default CustomerMapViewing;
