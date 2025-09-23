import React, { useState } from 'react';
import { Form, FormGroup, Input, Label, Button, Row, Col } from 'reactstrap';
import CommonModal from './modal';
import LocationMap from './LocationMap';
import axios from 'axios';
import Swal from 'sweetalert2';

const AddNewLocation = ({ buttonLabel = "Add New Location", onSuccess }) => {
  const [Large, setLarge] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    locationType: '',
    address: '',
    start_hour: '',
    end_hour: '',
    radius: '',
    latitude: '',
    longitude: ''
  });

  const LargeModaltoggle = () => setLarge(!Large);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: Number(lat).toFixed(6),
      longitude: Number(lng).toFixed(6)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      alert("Please select a location on the map.");
      return;
    }

    if (!formData.radius) {
      alert("Please specify the radius.");
      return;
    }

    try {
      const res = await axios.post('https://v21.mysutera.my/api/create-location/', formData);
      setLarge(false);

      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Location Added',
          text: res.data.message || 'New location was added successfully.',
          confirmButtonText: 'OK'
        }).then(() => {
          // Call the success callback to refresh data
          if (onSuccess) {
            onSuccess();
          }
        });
      }, 300);

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Something went wrong!',
      });
    }
  };

  return (
    <>
      <Button
        color="primary"
        onClick={LargeModaltoggle}
        style={buttonLabel === "+" ? {
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          padding: 0,
          fontSize: '20px'
        } : {
          padding: '6px 12px',
          borderRadius: '8px'
        }}
      >
        {buttonLabel}
      </Button>

      <CommonModal isOpen={Large} title="Add New Location" toggler={LargeModaltoggle} size="xl">
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Left Column - Form Inputs */}
            <Col xs="12" sm="6" md="5">
              <FormGroup>
                <Label>Location Name</Label>
                <Input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </FormGroup>
              <FormGroup>
                <Label>Location Type</Label>
                <Input type="select" name="locationType" value={formData.locationType} onChange={handleChange} required>
                  <option value="">Select Location Type</option>
                  <option value="Office">Office</option>
                  <option value="Sites">Sites</option>
                  <option value="Project">Project</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>Location Address</Label>
                <Input type="text" name="address" value={formData.address} onChange={handleChange} required />
              </FormGroup>
              <FormGroup>
                <Label>Start Hour</Label>
                <Input type="time" name="start_hour" value={formData.start_hour} onChange={handleChange} required />
              </FormGroup>
              <FormGroup>
                <Label>End Hour</Label>
                <Input type="time" name="end_hour" value={formData.end_hour} onChange={handleChange} required />
              </FormGroup>
              <FormGroup>
                <Label>Radius (in meters)</Label>
                <Input type="number" name="radius" value={formData.radius} onChange={handleChange} required min="1" />
              </FormGroup>
              <FormGroup>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>

            {/* Right Column - Map + Button */}
            <Col xs="12" sm="6" md="7">
              <FormGroup>
                <Label>Select Location on Map</Label>
                <div style={{ height: "350px", maxHeight: "50vh", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
                  <LocationMap
                    onLocationSelect={handleLocationSelect}
                    externalCoords={[
                      parseFloat(formData.latitude) || null,
                      parseFloat(formData.longitude) || null,
                    ]}
                  />
                </div>
              </FormGroup>

              <div className="text-end mt-3">
                <Button color="primary" type="submit">Create Location</Button>
              </div>
            </Col>
          </Row>
        </Form>
      </CommonModal>
    </>
  );
};

export default AddNewLocation;
