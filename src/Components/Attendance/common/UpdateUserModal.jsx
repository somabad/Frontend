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
import axios from 'axios'; // ADDED: For contract types API call

const { Option } = Select;

const UpdateUserModal = ({ modal, toggle, user, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    phone: '',
    roleId: '',
    locations: [],
    department: '',   // ADDED: Department field
    position: '',     // ADDED: Position field
    contract_type_id: '' // ADDED: Contract type field
  });

  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [staffLocations, setStaffLocations] = useState([]);
  const [contractTypes, setContractTypes] = useState([]); // ADDED: Contract types state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  // ADDED: State for leave types and carry forward days
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [carryForwardDays, setCarryForwardDays] = useState({});
  const [currentLeaveBalances, setCurrentLeaveBalances] = useState({});

  useEffect(() => {
    if (!modal) return;

    const fetchData = async () => {
      try {
        // ADDED: Fetch contract types along with other data
        const [roleData, locationRes, staffLocationData, contractRes] = await Promise.all([
          getRoleList(),
          getLocationList(),
          getStaffLocations(),
          axios.get('http://127.0.0.1:8000/api/contract-type-list/'), // ADDED: Contract types API
        ]);

        setRoles(roleData);
        setLocations(locationRes.data);
        setStaffLocations(staffLocationData);
        setContractTypes(contractRes.data.data || contractRes.data); // ADDED: Set contract types
        setHasInitialized(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, [modal]);

  // ADDED: Fetch leave types when contract type is selected OR when user has existing contract type
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      // CHANGED: Check both form data AND user's existing contract type
      const contractTypeId = formData.contract_type_id || (user && user.contract_type_id);
      
      if (contractTypeId) {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/contract-type-leave-entitlements/${contractTypeId}/`);
          console.log('Leave types response:', response.data);
          
          const leaveData = response.data.data || response.data;
          setLeaveTypes(Array.isArray(leaveData) ? leaveData : []);
          
          // Initialize carry forward days with current values or 0
          const initialCarryForward = {};
          if (Array.isArray(leaveData)) {
            leaveData.forEach(leaveType => {
              // Use current balance if available, otherwise 0
              initialCarryForward[leaveType.leave_type_id] = currentLeaveBalances[leaveType.leave_type_id] || 0;
            });
          }
          setCarryForwardDays(initialCarryForward);
        } catch (err) {
          console.error('Failed to fetch leave types:', err);
          setLeaveTypes([]);
          setCarryForwardDays({});
        }
      } else {
        setLeaveTypes([]);
        setCarryForwardDays({});
      }
    };

    fetchLeaveTypes();
  }, [formData.contract_type_id, user]); // CHANGED: Added user dependency

  // ADDED: Fetch current leave balances when user data is loaded
  useEffect(() => {
    const fetchCurrentLeaveBalances = async () => {
      if (user && user.staffId) {
        try {
          const currentYear = new Date().getFullYear();
          const response = await axios.get(`http://127.0.0.1:8000/api/staff/${user.staffId}/leave-balance/?year=${currentYear}`);
          console.log('Current leave balances:', response.data);
          
          const balances = {};
          if (Array.isArray(response.data)) {
            response.data.forEach(balance => {
              if (balance.leave_type_id) {
                balances[balance.leave_type_id.leave_type_id || balance.leave_type_id] = balance.carry_forward_days || 0;
              }
            });
          }
          setCurrentLeaveBalances(balances);
        } catch (err) {
          console.error('Failed to fetch current leave balances:', err);
          setCurrentLeaveBalances({});
        }
      }
    };

    if (user && user.staffId) {
      fetchCurrentLeaveBalances();
    }
  }, [user]);

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
        department: user.department || '',       // ADDED: Initialize department
        position: user.position || '',           // ADDED: Initialize position
        contract_type_id: user.contract_type_id || '' // ADDED: Initialize contract type
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

  // ADDED: Handle carry forward days input change
  const handleCarryForwardChange = (leaveTypeId, value) => {
    setCarryForwardDays(prev => ({
      ...prev,
      [leaveTypeId]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ADDED: Include new fields in the update data
      await updateStaff(user.staffId, {
        userId: formData.userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        roleId: formData.roleId,
        department: formData.department,      // ADDED: Department
        position: formData.position,          // ADDED: Position
        contract_type_id: formData.contract_type_id // ADDED: Contract type
      });

      await updateStaffLocations(user.staffId, formData.locations);

      // ADDED: Update carry forward days if contract type is selected and there are leave types
      // CHANGED: Check both form data AND user's existing contract type
      const contractTypeId = formData.contract_type_id || (user && user.contract_type_id);
      if (contractTypeId && leaveTypes.length > 0) {
        try {
          const currentYear = new Date().getFullYear();
          const carryForwardData = Object.keys(carryForwardDays).map(leaveTypeId => ({
            leave_type_id: leaveTypeId,
            days: carryForwardDays[leaveTypeId]
          }));

          console.log('Updating carry forward days:', {
            staffId: user.staffId,
            year: currentYear,
            carryForwardData
          });

          await axios.post(`http://127.0.0.1:8000/api/staff/${user.staffId}/set-carry-forward/`, {
            year: currentYear,
            carry_forward_days: carryForwardData
          });

          console.log('Carry forward days updated successfully');
        } catch (carryForwardError) {
          console.error('Error updating carry forward days:', carryForwardError);
          // Don't fail the entire operation if carry forward update fails
          Swal.fire({
            icon: 'warning',
            title: 'User Updated with Warning',
            text: `User was updated successfully but there was an issue updating carry forward days: ${carryForwardError.message}`,
            confirmButtonText: 'OK'
          });
        }
      }

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

          {/* ADDED: Department Field */}
          <FormGroup>
            <Label for="department">Department</Label>
            <Input
              id="department"
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter department"
            />
          </FormGroup>

          {/* ADDED: Position Field */}
          <FormGroup>
            <Label for="position">Position</Label>
            <Input
              id="position"
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Enter position"
            />
          </FormGroup>

          {/* ADDED: Contract Type Field */}
          <FormGroup>
            <Label for="contract_type_id">Contract Type</Label>
            <Input
              id="contract_type_id"
              type="select"
              name="contract_type_id"
              value={formData.contract_type_id}
              onChange={handleChange}
            >
              <option value="">Select contract type</option>
              {contractTypes.map(contract => (
                <option key={contract.contract_type_id} value={contract.contract_type_id}>
                  {contract.name}
                </option>
              ))}
            </Input>
          </FormGroup>

          {/* ADDED: Carry Forward Days Input for Each Leave Type */}
          {/* CHANGED: Show immediately if user has existing contract type OR new contract type selected */}
          {(formData.contract_type_id || (user && user.contract_type_id)) && leaveTypes.length > 0 && (
            <FormGroup>
              <Label>Carry Forward Days (Current Year: {new Date().getFullYear()})</Label>
              {leaveTypes.map(leaveType => (
                <FormGroup key={leaveType.leave_type_id} style={{ marginBottom: '15px' }}>
                  <Label for={`carry-forward-${leaveType.leave_type_id}`} style={{ fontSize: '14px', marginBottom: '5px' }}>
                    {leaveType.leave_name} (Entitled: {leaveType.entitled_days} days)
                  </Label>
                  <Input
                    type="number"
                    id={`carry-forward-${leaveType.leave_type_id}`}
                    step="0.5"
                    min="0"
                    value={carryForwardDays[leaveType.leave_type_id] || 0}
                    onChange={(e) => handleCarryForwardChange(leaveType.leave_type_id, e.target.value)}
                    placeholder="Enter carry forward days"
                  />
                  <small className="text-muted">
                    Current: {currentLeaveBalances[leaveType.leave_type_id] || 0} days
                  </small>
                </FormGroup>
              ))}
            </FormGroup>
          )}

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