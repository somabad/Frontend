import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Input, Label, Button, Spinner } from 'reactstrap';
import CommonModal from './modal';
import Swal from 'sweetalert2';
import UpdatePassword from './UpdatePassword';
import { Select } from 'antd';
import {
  getLocationList,
  getStaffLocations,
  updateStaff,
  updateStaffLocations,
  getRoleList,
} from '../utils';

const { Option } = Select;

const UpdateUserModal = ({ modal, toggle, user, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    phone: '',
    roleId: '',
    locations: [],
  });

  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [staffLocations, setStaffLocations] = useState([]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!modal) return;

    const fetchData = async () => {
      try {
        const [roleData, locationRes, staffLocationData] = await Promise.all([
          getRoleList(),
          getLocationList(),
          getStaffLocations(),
        ]);

        setRoles(roleData);
        setLocations(locationRes.data);
        setStaffLocations(staffLocationData);
        setHasInitialized(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, [modal]);

  useEffect(() => {
    if (modal) {
      setHasInitialized(false);
    }
  }, [modal]);

  useEffect(() => {
    if (user && staffLocations.length > 0 && !hasInitialized) {
      const currentStaff = staffLocations.find((s) => s.staffId === user.staffId);
      const selectedLocationIds = currentStaff
        ? currentStaff.locations.map((loc) => loc.locationId)
        : [];

      setFormData({
        userId: user.userId || '',
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        roleId: user.roleId?.roleId || '',
        locations: selectedLocationIds,
      });

      setHasInitialized(true);
    }
  }, [user, staffLocations, hasInitialized]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (value) => {
    setFormData((prev) => ({ ...prev, locations: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateStaff(user.staffId, {
        userId: formData.userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        roleId: formData.roleId,
      });

      await updateStaffLocations(user.staffId, formData.locations);

      toggle(); // close the modal

      Swal.fire({
        icon: 'success',
        title: 'User updated successfully!',
        confirmButtonText: 'OK',
      }).then(() => {
        if (typeof onUpdateSuccess === 'function') {
          onUpdateSuccess(); // ✅ call refresh logic from parent
        }
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update failed',
        text: err.response?.data?.error || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  const openPasswordModal = () => {
    toggle();
    setPasswordModalOpen(true);
  };

  const onPasswordModalClose = () => {
    setPasswordModalOpen(false);
    toggle();
  };

  return (
    <>
      <CommonModal isOpen={modal} title="Update User" toggler={toggle}>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="userId">User ID</Label>
            <Input
              id="userId"
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              placeholder="Enter user ID"
            />
          </FormGroup>

          <FormGroup>
            <Label for="name">Name</Label>
            <Input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label for="phone">Phone</Label>
            <Input
              id="phone"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label for="roleId">Role</Label>
            <Input
              id="roleId"
              type="select"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              required
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.name}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label>Locations</Label>
            <Select
              mode="multiple"
              placeholder="Select location(s)"
              value={formData.locations}
              onChange={handleLocationChange}
              style={{ width: '100%' }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            >
              {locations.map((loc) => (
                <Option key={loc.locationId} value={loc.locationId}>
                  {loc.name}
                </Option>
              ))}
            </Select>
          </FormGroup>

          <div className="mt-3">
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={openPasswordModal}
            >
              Update Password
            </button>
          </div>

          <div className="mt-3 text-end">
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Update User'}
            </Button>
          </div>
        </Form>
      </CommonModal>

      {user && (
        <UpdatePassword
          btnText={null}
          value={user.staffId}
          externalModalOpen={passwordModalOpen}
          setExternalModalOpen={setPasswordModalOpen}
          onClose={onPasswordModalClose}
        />
      )}
    </>
  );
};

export default UpdateUserModal;
