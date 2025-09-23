import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader } from 'reactstrap';
import { Input } from 'antd';
import UserTableComponent from './UserTableComponent';
import AddNewUser from '../../common/AddNewUser';
import Loader from '../../Loader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

const UserTable = () => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();  // Use navigate hook

  const fetchUsers = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    const startTime = Date.now();
    try {
      const response = await axios.get('https://v21.mysutera.my/api/staff-list/');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      const elapsed = Date.now() - startTime;
      const delay = 3000 - elapsed;
      if (showLoader) {
        if (delay > 0) {
          setTimeout(() => setLoading(false), delay);
        } else {
          setLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    // Check sessionStorage for staffid and userType
    const staffId = sessionStorage.getItem('staffId');
    const userType = sessionStorage.getItem('userType');

    if (!staffId || userType === 'Staff') {
      // Redirect to login if conditions are met using navigate
      navigate('/login');
    } else {
      fetchUsers(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredData(allUsers);
    } else {
      const lowerSearch = searchText.toLowerCase();
      const filtered = allUsers.filter(user =>
        (user.name || '').toLowerCase().includes(lowerSearch) ||
        (user.email || '').toLowerCase().includes(lowerSearch) ||
        ((user.roleId?.name) || '').toLowerCase().includes(lowerSearch)
      );
      setFilteredData(filtered);
    }
  }, [searchText, allUsers]);

  const onSearch = (value) => setSearchText(value);

  return (
    <div style={{ paddingTop: '30px' }}>
      <Loader show={loading} />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" style={{ color: '#555555' }}>Staff Table</h5>
                <div className="d-flex align-items-center gap-2">
                  <Search
                    placeholder="Search user..."
                    allowClear
                    onSearch={onSearch}
                    onChange={(e) => setSearchText(e.target.value)}
                    value={searchText}
                    style={{ width: 200, marginRight: '10px' }}
                  />
                  <div className="d-none d-sm-block">
                    <AddNewUser buttonLabel="Add New User" onUserAdded={() => fetchUsers(false)} />
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {!loading && (
                  <UserTableComponent filteredData={filteredData} onRefresh={() => fetchUsers(false)} />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserTable;
