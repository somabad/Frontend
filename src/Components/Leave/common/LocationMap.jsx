import React, { useEffect, useState } from "react";
import { Card, CardBody } from "reactstrap";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const LocationMap = ({ externalCoords, onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Initialize position on mount:
  useEffect(() => {
    if (
      externalCoords &&
      Array.isArray(externalCoords) &&
      typeof externalCoords[0] === "number" &&
      typeof externalCoords[1] === "number"
    ) {
      setPosition(externalCoords);
      setLoading(false);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setPosition([coords.latitude, coords.longitude]);
          setLoading(false);
          onLocationSelect(coords.latitude, coords.longitude);
        },
        () => {
          // No fallback coordinates, show error or leave blank
          setLoading(false);
          setError(true);
        }
      );
    } else {
      setLoading(false);
      setError(true);
    }
  }, [externalCoords, onLocationSelect]);

  const MapEvents = () => {
    const map = useMap();

    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
      },
    });

    useEffect(() => {
      if (position) {
        map.setView(position, map.getZoom());
      }
    }, [position, map]);

    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardBody style={{ height: "400px" }} className="d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status" />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody style={{ height: "400px" }} className="d-flex justify-content-center align-items-center">
          <p>Unable to retrieve your location.</p>
        </CardBody>
      </Card>
    );
  }

  if (!position || isNaN(position[0]) || isNaN(position[1])) {
    return (
      <Card>
        <CardBody style={{ height: "400px" }} className="d-flex justify-content-center align-items-center">
          <p>Location not set.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody style={{ height: "400px" }}>
        <MapContainer center={position} zoom={17} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <MapEvents />
        </MapContainer>
        <p className="mt-2 mb-0" style={{ fontSize: "14px" }}>
          Latitude: {position[0].toFixed(6)} | Longitude: {position[1].toFixed(6)}
        </p>
      </CardBody>
    </Card>
  );
};

export default React.memo(LocationMap);
