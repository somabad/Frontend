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
  // ADDED: Import the utility functions
  getContractTypeLeaveEntitlements,
  setStaffCarryForward
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
  const [currentYear] = useState(new Date().getFullYear());

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

  // ADDED: Fetch leave types when contract type is selected or when user has existing contract
  useEffect(() => {
    const fetchLeaveTypesAndBalances = async () => {
      const contractTypeId = formData.contract_type_id;
      console.log('Fetching leave types for contract:', contractTypeId); // DEBUG
      
      if (contractTypeId) {
        try {
          // CHANGED: Use the utility function instead of direct axios call
          const leaveResponse = await getContractTypeLeaveEntitlements(contractTypeId);
          console.log('Leave types response:', leaveResponse); // DEBUG
          
          const leaveData = leaveResponse.data || leaveResponse;
          setLeaveTypes(Array.isArray(leaveData) ? leaveData : []);
          
          // If user exists and has staffId, fetch current leave balances
          if (user?.staffId) {
            try {
              // CHANGED: Use the existing get_leave_balance endpoint
              const balanceResponse = await axios.get(`http://127.0.0.1:8000/api/get-leave-balance/${user.staffId}/`);
              const balances = balanceResponse.data;
              console.log('Leave balances response:', balances); // DEBUG
              
              // Initialize carry forward days with current values or 0
              const initialCarryForward = {};
              if (Array.isArray(leaveData)) {
                leaveData.forEach(leaveType => {
                  const existingBalance = Array.isArray(balances) ? 
                    balances.find(balance => balance.leave_type_id === leaveType.leave_type_id) : null;
                  initialCarryForward[leaveType.leave_type_id] = 
                    existingBalance?.carry_forward_days || 0;
                });
              }
              setCarryForwardDays(initialCarryForward);
            } catch (balanceError) {
              console.error('Failed to fetch leave balances:', balanceError);
              // Initialize with 0 if balance fetch fails
              const initialCarryForward = {};
              if (Array.isArray(leaveData)) {
                leaveData.forEach(leaveType => {
                  initialCarryForward[leaveType.leave_type_id] = 0;
                });
              }
              setCarryForwardDays(initialCarryForward);
            }
          } else {
            // For new user or no staffId, initialize with 0
            const initialCarryForward = {};
            if (Array.isArray(leaveData)) {
              leaveData.forEach(leaveType => {
                initialCarryForward[leaveType.leave_type_id] = 0;
              });
            }
            setCarryForwardDays(initialCarryForward);
          }
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

    fetchLeaveTypesAndBalances();
  }, [formData.contract_type_id, user, currentYear]);

  // ADDED: Fetch leave types when user data is initialized with existing contract type
  useEffect(() => {
    const fetchInitialLeaveTypes = async () => {
      // Only fetch if user has a contract type and form data has been initialized
      if (user?.contract_type_id && formData.contract_type_id && hasInitialized) {
        console.log('Fetching initial leave types for existing contract:', formData.contract_type_id); // DEBUG
        try {
          // CHANGED: Use the utility function
          const leaveResponse = await getContractTypeLeaveEntitlements(formData.contract_type_id);
          const leaveData = leaveResponse.data || leaveResponse;
          setLeaveTypes(Array.isArray(leaveData) ? leaveData : []);
          
          // Fetch current leave balances
          if (user?.staffId) {
            try {
              const balanceResponse = await axios.get(`http://127.0.0.1:8000/api/get-leave-balance/${user.staffId}/`);
              const balances = balanceResponse.data;
              
              const initialCarryForward = {};
              if (Array.isArray(leaveData)) {
                leaveData.forEach(leaveType => {
                  const existingBalance = Array.isArray(balances) ? 
                    balances.find(balance => balance.leave_type_id === leaveType.leave_type_id) : null;
                  initialCarryForward[leaveType.leave_type_id] = 
                    existingBalance?.carry_forward_days || 0;
                });
              }
              setCarryForwardDays(initialCarryForward);
            } catch (balanceError) {
              console.error('Failed to fetch leave balances:', balanceError);
              const initialCarryForward = {};
              if (Array.isArray(leaveData)) {
                leaveData.forEach(leaveType => {
                  initialCarryForward[leaveType.leave_type_id] = 0;
                });
              }
              setCarryForwardDays(initialCarryForward);
            }
          }
        } catch (err) {
          console.error('Failed to fetch initial leave types:', err);
          setLeaveTypes([]);
          setCarryForwardDays({});
        }
      }
    };

    fetchInitialLeaveTypes();
  }, [hasInitialized, formData.contract_type_id, user, currentYear]);

  useEffect(() => {
    if (modal) {
      setHasInitialized(false);
      // ADDED: Reset leave types when modal opens
      setLeaveTypes([]);
      setCarryForwardDays({});
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
      if (formData.contract_type_id && leaveTypes.length > 0) {
        try {
          const carryForwardData = Object.keys(carryForwardDays).map(leaveTypeId => ({
            leave_type_id: leaveTypeId,
            days: carryForwardDays[leaveTypeId]
          }));

          console.log('Updating carry forward days:', {
            staffId: user.staffId,
            year: currentYear,
            carryForwardData
          });

          // CHANGED: Use the utility function
          await setStaffCarryForward(user.staffId, {
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
          {formData.contract_type_id && leaveTypes.length > 0 && (
            <FormGroup>
              <Label>Carry Forward Days (Current Year: {currentYear})</Label>
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