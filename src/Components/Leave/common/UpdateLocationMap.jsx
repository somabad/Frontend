import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const UpdateLocationMap = ({ externalCoords, onLocationSelect }) => {
  const [position, setPosition] = useState(externalCoords);

  const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  // Sync internal position state when externalCoords change
  useEffect(() => {
    if (
      Array.isArray(externalCoords) &&
      (!position || position[0] !== externalCoords[0] || position[1] !== externalCoords[1])
    ) {
      setPosition(externalCoords);
    }
  }, [externalCoords]);

  // Component to handle map clicks and update marker & parent
  const MapEvents = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
      },
    });

    // Center map on position change
    useEffect(() => {
      if (position) {
        map.setView(position, map.getZoom());
      }
    }, [position, map]);

    return null;
  };

  if (!position || isNaN(position[0]) || isNaN(position[1])) {
    return <div>Loading map...</div>;
  }

  return (
    <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={markerIcon} />
      <MapEvents />
    </MapContainer>
  );
};

export default UpdateLocationMap;
