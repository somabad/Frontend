import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Input, Label, Button, InputGroup, InputGroupText } from 'reactstrap';
import CommonModal from './modal';
import Swal from 'sweetalert2';
import { getRoleList, createNewUser, getLocationList, updateStaffLocations } from '../utils';
import { Eye, EyeOff } from 'react-feather';
import { Select } from 'antd';
import axios from 'axios';

const { Option } = Select;

const AddNewUser = ({ buttonLabel = "Add New User", onUserAdded }) => {
  const defaultFormData = {
    userId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
    locations: [],
    created_at: '',
    department: '',
    position_id: '',
    carry_forward_days: ''
  };

  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [positions, setPositions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [carryForwardDays, setCarryForwardDays] = useState({});
  const [entitledOverrides, setEntitledOverrides] = useState({});

  const toggle = () => {
    if (modal) {
      setFormData(defaultFormData);
      setShowPassword(false);
      setCarryForwardDays({});
      setEntitledOverrides({});
    }
    setModal(!modal);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roleData, locationRes, positionRes] = await Promise.all([
          getRoleList(),
          getLocationList(),
          axios.get('http://127.0.0.1:8000/api/position-list/'),
        ]);

        setRoles(roleData);
        setLocations(locationRes.data);
        setPositions(positionRes.data || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      if (formData.position_id) {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/position-leave-entitlements/${formData.position_id}/`);
          const leaveData = response.data.data || response.data;
          setLeaveTypes(Array.isArray(leaveData) ? leaveData : []);

          const initialCarry = {};
          const initialOverride = {};
          (Array.isArray(leaveData) ? leaveData : []).forEach(lt => {
            initialCarry[lt.leave_type_id] = 0;
            initialOverride[lt.leave_type_id] = '';
          });
          setCarryForwardDays(initialCarry);
          setEntitledOverrides(initialOverride);
        } catch (err) {
          console.error('Failed to fetch position entitlements:', err);
          setLeaveTypes([]);
          setCarryForwardDays({});
          setEntitledOverrides({});
        }
      } else {
        setLeaveTypes([]);
        setCarryForwardDays({});
        setEntitledOverrides({});
      }
    };

    fetchLeaveTypes();
  }, [formData.position_id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationChange = (value) => {
    setFormData((prev) => ({ ...prev, locations: value }));
  };

  const handleCarryForwardChange = (leaveTypeId, value) => {
    setCarryForwardDays(prev => ({
      ...prev,
      [leaveTypeId]: parseFloat(value) || 0
    }));
  };

  const handleEntitledOverrideChange = (leaveTypeId, value) => {
    setEntitledOverrides(prev => ({
      ...prev,
      [leaveTypeId]: value
    }));
  };

  const getMalaysiaTime = () => {
    const now = new Date();
    const options = { timeZone: "Asia/Kuala_Lumpur" };

    const year = now.toLocaleString('en-US', { ...options, year: 'numeric' });
    const month = now.toLocaleString('en-US', { ...options, month: '2-digit' });
    const day = now.toLocaleString('en-US', { ...options, day: '2-digit' });
    const hours = now.toLocaleString('en-US', { ...options, hour: '2-digit', hour12: false }).padStart(2, '0');
    const minutes = now.toLocaleString('en-US', { ...options, minute: '2-digit' }).padStart(2, '0');
    const seconds = now.toLocaleString('en-US', { ...options, second: '2-digit' }).padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(6, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const password = formData.password;
    const hasMinLength = password.length >= 8;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasMinLength || !hasSymbol) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be at least 8 characters long and include at least one symbol. eg: /[!@#$%^&*(),.?":{}|<>]/.',
      });
      return;
    }

    const malaysiaTime = getMalaysiaTime();

    try {
      const userData = {
        userId: formData.userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        roleId: formData.roleId,
        department: formData.department,
        position_id: formData.position_id,
        created_at: malaysiaTime
      };

      console.log('Creating user with data:', userData);
      const res = await createNewUser(userData);
      console.log('User creation response:', res);

      if (res && formData.position_id && leaveTypes.length > 0) {
        try {
          let staffId = res.staffId || res.id || res.staff_id || res.userId;
          
          if (!staffId) {
            console.log('No staffId in response, fetching from user list...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
              const userListResponse = await axios.get('http://127.0.0.1:8000/api/staff-list/');
              const createdUser = userListResponse.data.find(user => 
                user.userId === formData.userId || user.email === formData.email
              );
              if (createdUser) {
                staffId = createdUser.staffId;
                console.log('Found staffId from user list:', staffId);
              }
            } catch (fetchError) {
              console.error('Error fetching user list:', fetchError);
            }
          }
          
          if (staffId) {
            const currentYear = new Date().getFullYear();
            const carryForwardData = Object.keys(carryForwardDays).map(leaveTypeId => {
              const override = entitledOverrides[leaveTypeId];
              const payload = {
                leave_type_id: leaveTypeId,
                days: carryForwardDays[leaveTypeId]
              };
              if (override !== '' && override !== null && override !== undefined) {
                payload.entitled_days = parseFloat(override);
              }
              return payload;
            });

            console.log('Setting carry forward days:', {
              staffId,
              year: currentYear,
              carryForwardData
            });

            await axios.post(`http://127.0.0.1:8000/api/set-carry-forward/${staffId}/`, {
              year: currentYear,
              carry_forward_days: carryForwardData
            });

            console.log('Carry forward days set successfully');
          }
        } catch (carryForwardError) {
          console.error('Error setting carry forward days:', carryForwardError);
          Swal.fire({
            icon: 'warning',
            title: 'User Created with Warning',
            text: `User was created successfully but there was an issue setting carry forward days: ${carryForwardError.message}`,
            confirmButtonText: 'OK'
          });
        }
      }

      if (res && formData.locations.length > 0) {
        try {
          let staffId = res.staffId || res.id || res.staff_id || res.userId;
          
          if (!staffId) {
            console.log('No staffId in response, fetching from user list...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
              const userListResponse = await axios.get('http://127.0.0.1:8000/api/staff-list/');
              const createdUser = userListResponse.data.find(user => 
                user.userId === formData.userId || user.email === formData.email
              );
              if (createdUser) {
                staffId = createdUser.staffId;
                console.log('Found staffId from user list:', staffId);
              }
            } catch (fetchError) {
              console.error('Error fetching user list:', fetchError);
            }
          }
          
          console.log('Attempting to assign locations. StaffId:', staffId, 'Locations:', formData.locations);
          
          if (staffId) {
            await updateStaffLocations(staffId, formData.locations);
            console.log('Locations assigned successfully');
          } else {
            console.error('No staffId found in response:', res);
            throw new Error('No staffId found in user creation response');
          }
        } catch (locationError) {
          console.error('Error assigning locations:', locationError);
          Swal.fire({
            icon: 'warning',
            title: 'User Created with Warning',
            text: `User was created successfully but there was an issue assigning locations: ${locationError.message}`,
            confirmButtonText: 'OK'
          });
        }
      } else {
        console.log('No locations to assign or user creation failed');
      }

      toggle();

      Swal.fire({
        icon: 'success',
        title: 'User Created',
        text: res.message || 'New user has been successfully created!',
        confirmButtonText: 'OK'
      }).then(() => {
        if (onUserAdded) {
          onUserAdded();
        }
      });

    } catch (err) {
      console.error('Error in handleSubmit:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Something went wrong!',
      });
    }
  };

  return (
    <>
      <Button color="primary" onClick={toggle}>
        {buttonLabel}
      </Button>

      <CommonModal isOpen={modal} title="Add New User" toggler={toggle}>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>User ID</Label>
            <Input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Name</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Phone</Label>
            <Input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Password</Label>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <InputGroupText
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer' }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </InputGroupText>
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <Label>Role</Label>
            <Input
              type="select"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              required
            >
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role.roleId} value={role.roleId}>{role.name}</option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label>Department</Label>
            <Input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter department"
            />
          </FormGroup>

          <FormGroup>
            <Label>Position</Label>
            <Input
              type="select"
              name="position_id"
              value={formData.position_id}
              onChange={handleChange}
            >
              <option value="">Select position</option>
              {positions.map(pos => (
                <option key={pos.position_id} value={pos.position_id}>{pos.name}</option>
              ))}
            </Input>
          </FormGroup>

          {formData.position_id && leaveTypes.length > 0 && (
            <div>
              <h5>Leave Entitlements (Current Year: {new Date().getFullYear()})</h5>
              <div style={{ display: 'grid', gap: '12px', marginTop: '8px' }}>
                {leaveTypes.map(leaveType => (
                  <div
                    key={leaveType.leave_type_id}
                    style={{
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      padding: '12px',
                      background: '#f9f9f9'
                    }}
                  >
                    <div style={{ marginBottom: '6px', fontWeight: '600' }}>
                      {leaveType.leave_name} (Entitled: {leaveType.entitled_days} days)
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 150px' }}>
                        <Label>Carry Forward</Label>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          value={carryForwardDays[leaveType.leave_type_id] || 0}
                          onChange={(e) => handleCarryForwardChange(leaveType.leave_type_id, e.target.value)}
                          placeholder="Enter carry forward"
                        />
                      </div>

                      <div style={{ flex: '1 1 150px' }}>
                        <Label>Override Entitled Days</Label>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          value={entitledOverrides[leaveType.leave_type_id] ?? ''}
                          onChange={(e) => handleEntitledOverrideChange(leaveType.leave_type_id, e.target.value)}
                          placeholder={`Default: ${leaveType.entitled_days}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
              {locations.map(location => (
                <Option key={location.locationId} value={location.locationId}>{location.name}</Option>
              ))}
            </Select>
          </FormGroup>

          <div style={{ textAlign: 'right' }}>
            <Button color="primary" type="submit">
              Create User
            </Button>
          </div>
        </Form>
      </CommonModal>
    </>
  );
};

export default AddNewUser;
