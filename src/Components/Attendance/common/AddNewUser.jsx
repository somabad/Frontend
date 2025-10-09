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
    department: '',   // ADDED
    position: '',     // ADDED
    contract_type_id: '', // ADDED
    carry_foward_days: '' //ADDED
  };

  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const toggle = () => {
    if (modal) {
      setFormData(defaultFormData);
      setShowPassword(false);
    }
    setModal(!modal);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roleData, locationRes, contractRes] = await Promise.all([
          getRoleList(),
          getLocationList(),
          axios.get('http://127.0.0.1:8000/api/contract-type-list/'), 
        ]);

        setRoles(roleData);
        setLocations(locationRes.data);

        // ✅ Important — check the shape of returned data
        console.log('Contract types response:', contractRes.data);

        setContractTypes(contractRes.data.data || contractRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationChange = (value) => {
    setFormData((prev) => ({ ...prev, locations: value }));
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

    // FIXED: Proper template literal syntax
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
      // Create user first (without locations)
      const userData = {
        userId: formData.userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        roleId: formData.roleId,
        department: formData.department,      // ADDED
        position: formData.position,          // ADDED
        contract_type_id: formData.contract_type_id, // ADDED
        created_at: malaysiaTime
      };

      console.log('Creating user with data:', userData);
      const res = await createNewUser(userData);
      console.log('User creation response:', res);

      // If user creation is successful and locations are selected, assign locations
      if (res && formData.locations.length > 0) {
        try {
          // Try different possible field names for staffId
          let staffId = res.staffId || res.id || res.staff_id || res.userId;
          
          // If we don't have staffId from response, try to fetch it from the user list
          if (!staffId) {
            console.log('No staffId in response, fetching from user list...');
            // Add a small delay to ensure user is created in the database
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
          // Don't fail the entire operation if location assignment fails
          Swal.fire({
            icon: 'warning',
            title: 'User Created with Warning',
            // FIXED: Proper template literal syntax
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
          onUserAdded(); // 🔁 Triggers silent data reload
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
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Enter position"
            />
          </FormGroup>

          <FormGroup>
            <Label>Contract Type</Label>
            <Input
              type="select"
              name="contract_type_id"
              value={formData.contract_type_id}
              onChange={handleChange}
              required
            >
              <option value="">Select contract type</option>
              {contractTypes.map(contract => (
                <option key={contract.contract_type_id} value={contract.contract_type_id}>
                  {contract.name}
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