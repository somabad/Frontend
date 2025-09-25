// === UpdateLocationModal.jsx ===
import React, { useState, useEffect } from 'react';
import { Col, Row, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import axios from 'axios';
import CommonModal from './modal';
import UpdateLocationMap from '../common/UpdateLocationMap';
import Swal from 'sweetalert2';

const UpdateLocationModal = ({ modal, toggle, locationId, location, onUpdateSuccess }) => {
  const [locationData, setLocationData] = useState({
    name: '',
    locationType: '',
    latitude: '',
    longitude: '',
    radius: '',
    address: '',
    start_hour: '',
    end_hour: '',
  });

  useEffect(() => {
    if (location) {
      setLocationData({
        name: location.name || '',
        locationType: formatLocationType(location.locationType),
        latitude: location.latitude || '',
        longitude: location.longitude || '',
        radius: location.radius || '',
        address: location.address || '',
        start_hour: location.start_hour || '',
        end_hour: location.end_hour || '',
      });
    } else if (locationId) {
      const fetchLocation = async () => {
        try {
          const res = await axios.get(`https://v21.mysutera.my/api/location-list/${locationId}/`);
          const data = res.data;
          setLocationData({
            name: data.name || '',
            locationType: formatLocationType(data.locationType),
            latitude: data.latitude || '',
            longitude: data.longitude || '',
            radius: data.radius || '',
            address: data.address || '',
            start_hour: data.start_hour || '',
            end_hour: data.end_hour || '',
          });
        } catch (err) {
          console.error('Failed to fetch location:', err);
        }
      };
      fetchLocation();
    }
  }, [locationId, location]);

  const formatLocationType = (type) => {
    if (!type) return '';
    const lower = type.toLowerCase();
    if (lower === 'office') return 'Office';
    if (lower === 'sites') return 'Sites';
    if (lower === 'project') return 'Project';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSelect = (lat, lng) => {
    setLocationData((prev) => ({
      ...prev,
      latitude: Number(lat).toFixed(6),
      longitude: Number(lng).toFixed(6),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(locationData.radius) <= 0) {
      alert('Radius must be at least 1 meter.');
      return;
    }

    try {
      await axios.post(`https://v21.mysutera.my/api/update-location/${locationId}/`, locationData);

      Swal.fire({
        icon: 'success',
        title: 'Location Updated',
        text: 'The location was successfully updated.',
        confirmButtonText: 'OK',
      }).then(() => {
        toggle();
        if (onUpdateSuccess) onUpdateSuccess();
      });
    } catch (err) {
      console.error('Error updating location:', err.response?.data || err.message);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.error || 'Failed to update location.',
      });
    }
  };

  const latitude = parseFloat(locationData.latitude);
  const longitude = parseFloat(locationData.longitude);
  const isValidCoords = !isNaN(latitude) && !isNaN(longitude);

  return (
    <CommonModal
      isOpen={modal}
      title={`Update Location - ${locationData.name || 'Loading...'}`}
      toggler={toggle}
      size="xl"
    >
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md="6">
            <FormGroup><Label>Location Name</Label><Input type="text" name="name" value={locationData.name} onChange={handleChange} required /></FormGroup>
            <FormGroup><Label>Location Type</Label><Input type="select" name="locationType" value={locationData.locationType} onChange={handleChange} required><option value="">Select Type</option><option value="Office">Office</option><option value="Sites">Sites</option><option value="Project">Project</option></Input></FormGroup>
            <FormGroup><Label>Address</Label><Input type="text" name="address" value={locationData.address} onChange={handleChange} required /></FormGroup>
            <FormGroup><Label>Start Hour</Label><Input type="time" name="start_hour" value={locationData.start_hour} onChange={handleChange} required /></FormGroup>
            <FormGroup><Label>End Hour</Label><Input type="time" name="end_hour" value={locationData.end_hour} onChange={handleChange} required /></FormGroup>
            <FormGroup><Label>Radius (in meters)</Label><Input type="number" name="radius" value={locationData.radius} onChange={handleChange} required min="1" /></FormGroup>
            <FormGroup><Label>Latitude</Label><Input type="number" name="latitude" value={locationData.latitude} onChange={handleChange} step="0.000001" required /></FormGroup>
            <FormGroup><Label>Longitude</Label><Input type="number" name="longitude" value={locationData.longitude} onChange={handleChange} step="0.000001" required /></FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label>Update Location on Map</Label>
              <div style={{ height: '350px', maxHeight: '50vh', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                {isValidCoords ? (
                  <UpdateLocationMap
                    onLocationSelect={handleLocationSelect}
                    externalCoords={[latitude, longitude]}
                  />
                ) : (
                  <div>Loading map...</div>
                )}
              </div>
              <p className="mt-2 mb-0 text-muted" style={{ fontSize: '14px' }}>
                Latitude: {locationData.latitude} | Longitude: {locationData.longitude}
              </p>
            </FormGroup>
            <div className="text-end mt-3">
              <Button color="primary" type="submit">Update Location</Button>
            </div>
          </Col>
        </Row>
      </Form>
    </CommonModal>
  );
};

export default UpdateLocationModal;
