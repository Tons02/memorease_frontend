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
  Card,
  CardMedia,
  IconButton,
  CardContent,
  Divider,
} from "@mui/material";
import * as turf from "@turf/turf";
import { EditControl } from "react-leaflet-draw";
import {
  Add,
  Check,
  ChevronLeft,
  ChevronRight,
  Dashboard,
  Map,
} from "@mui/icons-material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import "leaflet-routing-machine";
import L from "leaflet";
import { useGetCemeteryQuery } from "../../redux/slices/cemeterySlice";
import { useGetDeceasedQuery } from "../../redux/slices/deceasedSlice";

const MapDeceased = () => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedFullName, setSelectedFullName] = useState(null);
  const [userIconState, setIconState] = useState(null);
  const [currentDeceasedIndex, setCurrentDeceasedIndex] = useState({});

  const nextDeceased = (lotId, deceasedArray) => {
    setCurrentDeceasedIndex((prev) => ({
      ...prev,
      [lotId]: ((prev[lotId] || 0) + 1) % deceasedArray.length,
    }));
  };

  const prevDeceased = (lotId, deceasedArray) => {
    setCurrentDeceasedIndex((prev) => ({
      ...prev,
      [lotId]:
        ((prev[lotId] || 0) - 1 + deceasedArray.length) % deceasedArray.length,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (birthday, deathDate) => {
    if (!birthday || !deathDate) return null;

    const birth = new Date(birthday);
    const death = new Date(deathDate);

    if (death < birth) return null; // invalid case

    const diffMs = death - birth;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const years = Math.floor(diffDays / 365.25);
    if (years >= 1) return `${years} year${years > 1 ? "s" : ""}`;

    const months = Math.floor(diffDays / 30.44); // avg month length
    if (months >= 1) return `${months} month${months > 1 ? "s" : ""}`;

    return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  };

  useEffect(() => {
    const getLocationWithFallback = async () => {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported");
        setUserLocation({ lat: 14.293145, lng: 120.971924 });
        return;
      }

      // Try high accuracy first
      try {
        await getCurrentPositionPromise({
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000,
        });
      } catch (highAccuracyError) {
        console.warn("High accuracy failed:", highAccuracyError);

        // Fallback to low accuracy
        try {
          await getCurrentPositionPromise({
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 600000,
          });
        } catch (lowAccuracyError) {
          console.error("All location attempts failed:", lowAccuracyError);
          setIconState(false);
          setUserLocation({ lat: 14.293145, lng: 120.971924 });
        }
      }
    };

    const getCurrentPositionPromise = (options) => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setIconState(true);
            resolve(position);
          },
          reject,
          options
        );
      });
    };

    getLocationWithFallback();
  }, []);

  console.log("userLocation", userLocation);

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
          Deceased Map
        </Typography>
      </Breadcrumbs>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" sx={{ mr: 2, fontWeight: 600 }}>
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
            <MapContainer center={center} zoom={50} style={{ height: "101%" }}>
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
                    polygon: false,
                  }}
                  edit={{
                    edit: false,
                    remove: false,
                  }}
                />
              </FeatureGroup>

              {lotGroups &&
                Object.entries(lotGroups).map(([lotId, { lot, deceased }]) => (
                  <Polygon
                    key={lotId}
                    positions={lot.coordinates}
                    pathOptions={{
                      color: "#15803d",
                      fillOpacity: 0.5,
                    }}
                  >
                    <Popup maxWidth={400} className="custom-deceased-popup">
                      <Card
                        sx={{
                          width: "100%",
                          maxWidth: {
                            xs: "280px",
                            sm: "320px",
                            md: "360px",
                            lg: "400px",
                          },
                          minWidth: { xs: "260px", sm: "300px" },
                          maxHeight: { xs: "90vh", sm: "auto" },
                          overflow: "hidden",
                        }}
                      >
                        {(() => {
                          const currentIndex =
                            currentDeceasedIndex[lot.id] || 0; // Replace 'lot.id' with your lot identifier
                          const currentDeceased = deceased[currentIndex];

                          return (
                            <>
                              {/* Header Section */}
                              <Box
                                sx={{
                                  backgroundColor: "secondary.main",
                                  color: "white",
                                  p: { xs: 1.5, sm: 2 },
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    fontSize: {
                                      xs: "0.9rem",
                                      sm: "1rem",
                                      md: "1.25rem",
                                    },
                                  }}
                                >
                                  🕊️ Memorial
                                </Typography>
                                {deceased.length > 1 && (
                                  <Box
                                    sx={{
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.2)",
                                      px: { xs: 0.75, sm: 1 },
                                      py: 0.5,
                                      borderRadius: 1,
                                      fontSize: {
                                        xs: "0.65rem",
                                        sm: "0.75rem",
                                      },
                                    }}
                                  >
                                    {currentIndex + 1} / {deceased.length}
                                  </Box>
                                )}
                              </Box>

                              {/* Single Certificate Image Section */}
                              <Box sx={{ position: "relative" }}>
                                {currentDeceased.lot_image ? (
                                  <CardMedia
                                    component="img"
                                    image={currentDeceased.lot_image}
                                    alt={`${currentDeceased.full_name} Certificate`}
                                    sx={{
                                      width: "100%",
                                      height: {
                                        xs: "140px",
                                        sm: "180px",
                                        md: "200px",
                                      },
                                      objectFit: "contain",
                                      backgroundColor: "#f5f5f5",
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      height: {
                                        xs: "140px",
                                        sm: "180px",
                                        md: "200px",
                                      },
                                      backgroundColor: "#f5f5f5",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexDirection: "column",
                                      gap: 1,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        fontSize: {
                                          xs: "2rem",
                                          sm: "2.5rem",
                                          md: "3rem",
                                        },
                                        opacity: 0.3,
                                      }}
                                    >
                                      📜
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        fontSize: {
                                          xs: "0.7rem",
                                          sm: "0.75rem",
                                          md: "0.875rem",
                                        },
                                      }}
                                    >
                                      No Certificate Available
                                    </Typography>
                                  </Box>
                                )}

                                {/* Navigation arrows - only for multiple deceased persons */}
                                {deceased.length > 1 && (
                                  <>
                                    <IconButton
                                      sx={{
                                        position: "absolute",
                                        left: { xs: 4, sm: 8 },
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                                        color: "white",
                                        "&:hover": {
                                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                                        },
                                        width: { xs: 28, sm: 32 },
                                        height: { xs: 28, sm: 32 },
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        prevDeceased(lot.id, deceased);
                                      }}
                                      size="small"
                                    >
                                      <ChevronLeft fontSize="small" />
                                    </IconButton>

                                    <IconButton
                                      sx={{
                                        position: "absolute",
                                        right: { xs: 4, sm: 8 },
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                                        color: "white",
                                        "&:hover": {
                                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                                        },
                                        width: { xs: 28, sm: 32 },
                                        height: { xs: 28, sm: 32 },
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        nextDeceased(lot.id, deceased);
                                      }}
                                      size="small"
                                    >
                                      <ChevronRight fontSize="small" />
                                    </IconButton>

                                    {/* Deceased Person Indicators */}
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        bottom: { xs: 6, sm: 8 },
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        display: "flex",
                                        gap: 0.5,
                                      }}
                                    >
                                      {deceased.map((_, index) => (
                                        <Box
                                          key={index}
                                          sx={{
                                            width: { xs: 6, sm: 8 },
                                            height: { xs: 6, sm: 8 },
                                            borderRadius: "50%",
                                            backgroundColor:
                                              index === currentIndex
                                                ? "white"
                                                : "rgba(255, 255, 255, 0.5)",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                          }}
                                          onClick={() =>
                                            setCurrentDeceasedIndex((prev) => ({
                                              ...prev,
                                              [lot.id]: index,
                                            }))
                                          }
                                        />
                                      ))}
                                    </Box>
                                  </>
                                )}
                              </Box>

                              <CardContent
                                sx={{
                                  p: { xs: 1.5, sm: 2 },
                                  maxHeight: { xs: "40vh", sm: "auto" },
                                  overflow: "auto",
                                }}
                              >
                                {/* Person Name */}
                                <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                                  <Typography
                                    variant="h5"
                                    component="div"
                                    sx={{
                                      fontWeight: "bold",
                                      textAlign: "center",
                                      color: "secondary.main",
                                      fontSize: {
                                        xs: "1rem",
                                        sm: "1.2rem",
                                        md: "1.5rem",
                                      },
                                    }}
                                  >
                                    {currentDeceased.full_name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      textAlign: "center",
                                      fontSize: {
                                        xs: "0.7rem",
                                        sm: "0.75rem",
                                        md: "0.875rem",
                                      },
                                    }}
                                  >
                                    In Loving Memory
                                  </Typography>
                                </Box>

                                <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />

                                {/* Life Information */}
                                <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mb: { xs: 0.75, sm: 1 },
                                      flexDirection: {
                                        xs: "column",
                                        sm: "row",
                                      },
                                      gap: { xs: 0.5, sm: 0 },
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        fontSize: {
                                          xs: "0.7rem",
                                          sm: "0.75rem",
                                          md: "0.875rem",
                                        },
                                      }}
                                    >
                                      🎂 Born:
                                    </Typography>
                                    <Typography
                                      variant="body1"
                                      fontWeight="medium"
                                      sx={{
                                        fontSize: {
                                          xs: "0.75rem",
                                          sm: "0.875rem",
                                          md: "1rem",
                                        },
                                        textAlign: {
                                          xs: "center",
                                          sm: "right",
                                        },
                                      }}
                                    >
                                      {formatDate(currentDeceased.birthday)}
                                    </Typography>
                                  </Box>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mb: { xs: 0.75, sm: 1 },
                                      flexDirection: {
                                        xs: "column",
                                        sm: "row",
                                      },
                                      gap: { xs: 0.5, sm: 0 },
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        fontSize: {
                                          xs: "0.7rem",
                                          sm: "0.75rem",
                                          md: "0.875rem",
                                        },
                                      }}
                                    >
                                      🕊️ Passed:
                                    </Typography>
                                    <Typography
                                      variant="body1"
                                      fontWeight="medium"
                                      sx={{
                                        fontSize: {
                                          xs: "0.75rem",
                                          sm: "0.875rem",
                                          md: "1rem",
                                        },
                                        textAlign: {
                                          xs: "center",
                                          sm: "right",
                                        },
                                      }}
                                    >
                                      {formatDate(currentDeceased.death_date)}
                                    </Typography>
                                  </Box>

                                  {/* Age at death */}
                                  {calculateAge(
                                    currentDeceased.birthday,
                                    currentDeceased.death_date
                                  ) && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        flexDirection: {
                                          xs: "column",
                                          sm: "row",
                                        },
                                        gap: { xs: 0.5, sm: 0 },
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                          fontSize: {
                                            xs: "0.7rem",
                                            sm: "0.75rem",
                                            md: "0.875rem",
                                          },
                                        }}
                                      >
                                        Age at Passing:
                                      </Typography>
                                      <Typography
                                        variant="body1"
                                        color="secondary.main"
                                        fontWeight="bold"
                                        sx={{
                                          fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.875rem",
                                            md: "1rem",
                                          },
                                          textAlign: {
                                            xs: "center",
                                            sm: "right",
                                          },
                                        }}
                                      >
                                        {calculateAge(
                                          currentDeceased.birthday,
                                          currentDeceased.death_date
                                        )}{" "}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>

                                {/* Memorial Message */}
                                <Box
                                  sx={{
                                    backgroundColor: "grey.50",
                                    p: { xs: 1, sm: 1.5 },
                                    borderRadius: 1,
                                    borderLeft: "4px solid",
                                    borderColor: "secondary.main",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontStyle: "italic",
                                      textAlign: "center",
                                      color: "text.secondary",
                                      fontSize: {
                                        xs: "0.65rem",
                                        sm: "0.75rem",
                                        md: "0.875rem",
                                      },
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    "Forever in our hearts and memories"
                                  </Typography>
                                </Box>
                              </CardContent>
                            </>
                          );
                        })()}
                      </Card>
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
